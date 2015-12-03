define([
	'jquery',
	'underscore',
	'backbone',
	'handlebars',
	'views/ViewModelView'
], function ($, _, Backbone, Handlebars, ViewModelView) {
	'use strict';

	var _$workingElement = $(document.createElement("div"));


	// TODO: all changed stuff should be done on a virtual dom
	return ViewModelView.extend({

		initialize: function (options) {

			options = options || {};

			this.template = options.template || this.template || null;
			this._hasBindableElements = options.hasBindableElements || false;
			this._hasViewExtensions = options.hasViewExtensions || false;
			this._boundElements = [];
			this._boundExpr = {};
			this._boundAttr = {};
			this._boundVal = {};
			this._viewExtensions = [];

			ViewModelView.prototype.initialize.call(this, options);
		},

		render: function () {
			this._hookBeforeRender();
			if (this.template) this.$el.html(this.template(this._getTemplateVariables()));
			if (this._hasBindableElements) this._bindElements();
			if (this._hasViewExtensions) this._extendView();
			this._hookAfterRender();
			return this;
		},

		/**
		 * a hook which is executed before the rendering happens
		 * @protected
		 */
		_hookBeforeRender: function () {
			// hook which is executed before the rendering
		},

		/**
		 * a hook which is executed after the rendering is done
		 * @protected
		 */
		_hookAfterRender: function () {
			// hook which is executed after the rendering
		},

		/**
		 * @inherit
		 * @see Backbone.View::remove()
		 */
		remove: function () {
			if (this._hasBindableElements) this._unbindElements();
			if (this._hasViewExtensions) this._removeViewExtensions();
			Backbone.View.prototype.remove.apply(this, arguments);
		},

		/**
		 * prepares the template variables which will be passed to the template
		 * @returns {*}
		 * @protected
		 */
		_getTemplateVariables: function () {
			return this._viewBag.toJSON();
		},

		/**
		 * binds all elements which are marked via html markup
		 * @private
		 */
		_bindElements: function () {
			// todo: implement expression support for bindings
			// save the context
			var that = this;

			// get bindable elements
			var elements = this.$el.find("[data-bind-to], [data-bind-css-to], [data-bind-attr-to]");

			// bind each element to its model property
			elements.each(function (index, element) {
				var $element = $(element),
				    // value binding
				    prop     = $element.data("bindTo"),
				    // attribute binding
				    attrProp = $element.data("bindAttrTo"),
				    // css property binding
				    cssProp  = $element.data("bindCssTo"),
				    expr     = $element.data("bindExpr"),
				    // only two way binding if is input
				    isInput  = $element.is("input");


				if (prop) {
					prop = prop.split(",");
				}

				if (cssProp) {
					cssProp = cssProp.split(",");
				}

				if (attrProp) {
					attrProp = attrProp.split(",");
				}


				// two way binding if element is an input field
				if (isInput && prop) {

					var valBindingId = _.uniqueId("val-binding-");

					prop = prop[0];

					that._boundVal[valBindingId] = {
						$el: $element,
						value: that._viewBag.get(prop),
						isDirty: true
					};

					$element.on("input", function (event) {
						event.preventDefault();
						that._viewBag.set(prop, $element.val(), {doNotSetVal: true});
						return false;
					});

					that.listenTo(that._viewBag, "change:" + prop, function (model, value, options) {
						if (options && !options.doNotSetVal) {
							that._boundVal[valBindingId].value = value;
							that._boundVal[valBindingId].isDirty = true;
							if (!that._viewIsDirty) {
								that._viewIsDirty = true;
								window.requestAnimationFrame(function () {
									that._cleanUpDirtyView();
								});
							}
						}
					});

					$element.val(that._viewBag.get(prop));
				}
				// multi-binding for one way bound elements
				else if (prop) {

					// prepare the handlebars template
					if (expr) {
						expr = expr.replace(/\{/g, "{{").replace(/\}/g, "}}");
						expr = Handlebars.compile(expr);
						that._boundExpr[$element] = {expr: expr, prop: prop};
					}

					_.forEach(prop, function (p) {
						that.listenTo(that._viewBag, "change:" + p, function (model, value, options) {

							if (that._boundExpr[$element]) {
								// get the expression for the binding
								$element.html(that._boundExpr[$element].expr(model.pick(that._boundExpr[$element].prop)));
							}
							else {
								$element.html(value);
							}
						});
					});

					if (expr) {
						$element.html(that._boundExpr[$element].expr(model.pick(that._boundExpr[$element].prop)));
					}
					else {
						$element.html(that._viewBag.get(prop));
					}
				}

				if (attrProp || cssProp) {

					var attrBindingId = _.uniqueId("attr-binding-");

					that._boundAttr[attrBindingId] = {
						$el: $element,
						attributes: {},
						hasAttributeBinding: false,
						cssRules: {},
						hasCSSBinding: false,
						isDirty: false
					};

					_.forEach(attrProp, function (a) {
						var attributes    = a.split(":"),
						    attribute     = attributes[0],
						    bindAttribute = attributes[1];

						that._boundAttr[attrBindingId].attributes[attribute] = that._viewBag.get(bindAttribute);
						that._boundAttr[attrBindingId].hasAttributeBinding = true;

						that.listenTo(that._viewBag, "change:" + bindAttribute, function (model, value, options) {
							that._boundAttr[attrBindingId].attributes[attribute] = value;
							that._boundAttr[attrBindingId].isDirty = true;
							// todo: implement dirty views
							// todo: maybe this fix hack will do it
							if (!that._viewIsDirty) {
								that._viewIsDirty = true;
								window.requestAnimationFrame(function () {
									that._cleanUpDirtyView();
								});
							}
						});
					});

					_.forEach(cssProp, function (p) {

						var properties   = p.split(":"),
						    cssProperty  = properties[0],
						    bindProperty = properties[1];

						that._boundAttr[attrBindingId].hasCSSBinding = true;
						that._boundAttr[attrBindingId].cssRules[cssProperty] = that._viewBag.get(bindProperty);

						that.listenTo(that._viewBag, "change:" + bindProperty, function (model, value, options) {
							that._boundAttr[attrBindingId].cssRules[cssProperty] = value;
							// todo: implement dirty views
							// todo: maybe this fix hack will do it
							that._boundAttr[attrBindingId].isDirty = true;
							if (!that._viewIsDirty) {
								that._viewIsDirty = true;
								window.requestAnimationFrame(function () {
									that._cleanUpDirtyView();
								});
							}
						});
					});

				}

				that._boundElements.push($element);
			});
		},

		_unbindElements: function () {

			var that = this;

			// todo: performance!?

			_.forEach(this._boundElements, function ($element, index) {
				$element.off();
			});

			_.forEach(this._boundExpr, function (expr, index) {
				that._boundExpr[index] = null;
			});

			_.forEach(this._boundAttr, function (obj, index) {
				obj.$el = null;
			});

			_.forEach(this._boundVal, function (obj, index) {
				obj.$el = null;
			});

			this._boundAttr = null;
			this._boundVal = null;
		},

		_extendView: function () {
			// save the scope
			var that = this;
			// find all extended view elements
			var extendedEl = this.$el.find("[data-view-extension]");

			extendedEl.each(function (index, el) {
				var $el = $(el);
				var ext = _.capitalize(_.camelCase($el.data("viewExtension")));

				if (Backbone.ViewExtensions && Backbone.ViewExtensions[ext]) {
					that._viewExtensions.push(Backbone.ViewExtensions[ext]($el));
				}
				else {
					console.warn("a view extension with the name " + ext + " could not be found");
				}
			});
		},

		_removeViewExtensions: function () {
			_.forEach(this._viewExtensions, function (extension, index) {
				extension.destroy();
			});
		},

		_cleanUpDirtyView: function () {

			_.forEach(this._boundAttr, function (obj) {
				if (obj.isDirty) {

					var styleAttr, attrObj;

					if (obj.hasAttributeBinding) {
						attrObj = obj.attributes;

						if (!obj.hasCSSBinding) {
							obj.$el.attr(attrObj);
						}
					}

					if (obj.hasCSSBinding) {
						if (obj.hasAttributeBinding) {
							// we do not apply the css rules directly, we do this onto the working element in memory
							// and apply the style changes together with the changed attributes
							_$workingElement.css(obj.cssRules);
							// get the style attribute
							styleAttr = _$workingElement.attr("style");
							// clone and alter the attribute object
							attrObj = _.clone(attrObj);
							attrObj.style = styleAttr;
						}
						else {
							obj.$el.css(obj.cssRules);
						}
					}

					obj.isDirty = false;
				}
			});

			// VALUE CHANGES UPDATES MUST DONE BE AFTER THE ATTRIBUTES HAVE CHANGED

			_.forEach(this._boundVal, function (obj) {
				if (obj.isDirty) {
					obj.$el.val(obj.value);
					obj.isDirty = false;
				}
			});

			this._viewIsDirty = false;
		}

	});

});