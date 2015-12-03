/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'templates',
	'views/ViewModelView'
], function ($, _, Backbone, JST, ViewModelView) {
	'use strict';

	var __isMultiSelect = {isMultiSelect: true};
	var __isNotMultiSelect = {isMultiSelect: false};

	// TODO: clean up this class
	// TODO: check if the templates are called only once
	// FIXME: Make usable on mobile devices
	return ViewModelView.extend({
		itemTemplate: JST['app/scripts/templates/VirtualListViewItem.hbs'],

		tagName: 'div',

		className: 'virtual-list',

		events: {
			"click li": "_onClickItem",
			"scroll": "_onScroll",
			"wheel": "_onWheel"
		},

		initialize: function (options) {
			this.itemTemplate = options.itemTemplate || this.itemTemplate;
			this._listElements = {};
			this._requestAnimId = null;
			this._lastScrollTime = 0;
			this._isMultiSelect = options.isMultiSelect || false;
			this.collection = options.collection;
			this._disableChangeSelectedItem = options.disableChangeSelectedItem || false;

			ViewModelView.prototype.initialize.apply(this, options);

			if (!this._disableChangeSelectedItem) {
				this.listenTo(this.getViewBag(), "change:selectedItem", this._onChangeSelectedItem);
			}
			this.listenTo(this.collection, "update", this._onChangeCollection);
			this.listenTo(this.collection, "reset", this._onChangeCollection);
		},

		render: function () {

			// first create all needed elements
			// FIXME: this could cause a bad memory consumption
			// FIXME: maybe buffer this too
			this._createVirtualDomElements();

			// create an stretcher element
			this._stretcherEl = $("<div></div>");
			this.$el.append(this._stretcherEl);

			// create the child container
			this._$listEl = $("<ul class='virtual-list-container'></ul>");
			this._$listEl.appendTo(this.$el);

			// append the first element
			if (this.collection.length > 0) {
				this._firstRender();
			}

			return this;
		},

		reset: function () {
			this._createVirtualDomElements();
			this._$listEl.empty();
			if (this.collection.length > 0) {
				this.$el.css("display", "block");
				this._firstRender();
			} else {
				this.$el.css("display", "none");
			}
		},

		_firstRender: function () {
			var that = this;
			var model = this.collection.at(0);
			var $el = $(this._listElements[model.id || model.cid]);
			this._$listEl.append($el);

			// get the height
			// fixme: this looks dirty
			window.requestAnimFrame(function () {
				that._secondRender($el);
			});
		},

		_secondRender: function ($el) {
			// continue rendering because only after a repaint we can get the actual height of the list element
			this._itemHeight = $el.outerHeight(true);
			this._bodyHeight = this.$el.innerHeight();
			if (!this._baseBodyHeight) this._baseBodyHeight = this._bodyHeight;

			// get the visible items incl buffer elements
			this._visibleItems = Math.ceil(this._baseBodyHeight / this._itemHeight);
			this._visibleHeight = this._visibleItems * this._itemHeight;
			this._bufferedItems = this._visibleItems * 3;
			this._totalHeight = (this.collection.length) * this._itemHeight;

			// stretch the stretcher
			this._stretcherEl.height(this._totalHeight);

			if (this._baseBodyHeight > this._totalHeight) {
				this.$el.css("max-height", this._totalHeight);
			} else {
				this.$el.css("max-height", this._baseBodyHeight);
			}

			// clear the list
			this._$listEl.empty();

			// append the initial elements
			this._addVisibleItems(0, Math.min(this._bufferedItems, this.collection.length));
		},

		_createVirtualDomElements: function () {
			var that = this;
			// create the new needed elements
			this.collection.forEach(function (model, index) {
				var data = model.toJSON();
				data.id = model.id || model.cid;
				if (data.term == "") data.term = "# NO TERM NAME #";
				that._listElements[model.id || model.cid] = that.itemTemplate(data);
			});

			// check if some some elements arent needed anymore
			_.forEach(this._listElements, function (el, index) {
				if (!that.collection.get(index)) {
					that._listElements[index] = null;
					delete that._listElements[index];
				}
			});
		},

		_onScroll: function (event) {

			var that = this;
			this._$listEl.addClass("is-scrolling");
			this._requestAnimId = window.requestAnimFrame(function () {
				that._repaint();
			});

			this._lastScrollTime = Date.now();

			event.stopImmediatePropagation();
		},

		_onWheel: function (event) {

			var delta = this.$el.scrollTop() + event.originalEvent.deltaY / 2;

			this.$el.scrollTop(delta);
			event.preventDefault();
			event.stopImmediatePropagation();
			return false;
		},

		_repaint: function () {

			var that = this;
			var scrollTop = this.$el.scrollTop();

			if (!this._lastScrollY || Math.abs(this._lastScrollY - scrollTop) > this._visibleHeight) {
				var startIndex = Math.max(0, Math.round(scrollTop / this._itemHeight) - this._visibleItems);
				var stretcherHeight = this.collection.length * this._itemHeight;

				this._addVisibleItems(startIndex, Math.min(this._bufferedItems + startIndex, this.collection.length));

				this._lastScrollY = scrollTop;

				this._$listEl.css("transform", "translateY(" + startIndex * this._itemHeight + "px)");
				this._stretcherEl.height(stretcherHeight);

				if (this._bodyHeight > stretcherHeight) {
					this.$el.css("max-height", stretcherHeight);
				} else {
					this.$el.css("max-height", "200px");
				}
			}

			if (Date.now() - this._lastScrollTime > 100) {
				this._clearInvisibleItems();
				window.cancelRequestAnimFrame(this._requestAnimId);
				this._$listEl.removeClass("is-scrolling");
			}
			else {
				this._requestAnimId = window.requestAnimFrame(function () {
					that._repaint();
				});
			}

		},

		_addVisibleItems: function (start, end) {
			var df = $(document.createDocumentFragment());

			for (var i = start, l = end; i < l; i++) {
				var model = this.collection.at(i);
				var id = model.id || model.cid;
				var item = $(this._listElements[id]);

				if (!this._disableChangeSelectedItem && this.getViewBag("selectedItem") && this.getViewBag("selectedItem").indexOf(id) != -1) {
					item.addClass("selected");
				}

				df.append(item);
			}

			this._$listEl.children().css("display", "none").attr("data-remove", 1);

			this._$listEl.append(df);

		},

		_clearInvisibleItems: function () {
			this._$listEl.find("[data-remove=1]").remove();
		},

		_onClickItem: function (event) {
			var $target = $(event.currentTarget),
			    itemId  = $target.data("itemId");

			if (this._isMultiSelect) {
				var _old = this.getViewBag("selectedItem");
				var data  = null,
				    index = -1;

				if (!_old) {
					data = [];
				}
				else {
					data = _old.split(";");
					index = data.indexOf(itemId.toString());
				}

				if (index == -1) {
					data.push(itemId);
				}
				else {
					data.splice(index, 1);
				}

				if (data.length > 0) {
					data = data.join(";");
				}
				else {
					data = null;
				}

				this.setViewBag("selectedItem", data, __isMultiSelect);
			}
			else {
				this.setViewBag("selectedItem", itemId, __isNotMultiSelect);
			}
		},

		_onChangeSelectedItem: function (model, value, options) {

			if (this._isMultiSelect) {
				var that = this,
				    prev = model.previous("selectedItem"),
				    old  = null;

				if (value) {
					value = value.split(";");

					_.forEach(value, function (item) {
						that._$listEl.find("[data-item-id=" + item + "]").addClass("selected");
					});
				}

				if (prev) {
					prev = prev.split(";");
					old = value ? _.difference(prev, value) : prev;

					_.forEach(old, function (item) {
						that._$listEl.find("[data-item-id=" + item + "]").removeClass("selected");
					});
				}
			}
			else {
				this._$listEl.find("[data-item-id=" + model.previous('selectedItem') + "]").removeClass("selected");
				this._$listEl.find("[data-item-id=" + value + "]").addClass("selected");
			}
		},

		_onChangeCollection: function () {
			this.reset();
		}
	});

});
