/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'templates',
	"views/AbstractView"
], function ($, _, Backbone, JST, AbstractView) {
	'use strict';

	return AbstractView.extend({
		template: JST['app/scripts/templates/ToolbarView.hbs'],

		tagName: 'div',

		className: 'toolbar',

		events: {
			"click [data-role=toolbar-tool]": "_onToolbarToolClicked"
		},

		initialize: function (options) {
			this._tools = options.tools;
			this._toolValueProperty = options.toolValueProperty || "selectedTool";
			this._toolLabelProperty = options.toolLabelProperty || "selectedLabel";

			AbstractView.prototype.initialize.apply(this, arguments);

			this.listenTo(this.getViewBag(), "change:" + this._toolValueProperty, this._onSelectedToolChanged);
		},

		show: function() {
			this.$el.css({"visibility" : "visible"});
			this.$el.trigger("visible");
		},

		hide: function() {
			this.$el.css({"visibility" : "hidden"});
			this.$el.trigger("hidden");
		},

		_hookAfterRender: function () {
			// preselect the first tool
			this._onSelectedToolChanged(this.getViewBag(), this.getViewBag(this._toolValueProperty));
		},

		_getTemplateVariables: function () {
			var data = this._viewBag.toJSON();
			data.tools = this._tools;
			return data;
		},

		_onToolbarToolClicked: function (event) {
			var $el = $(event.currentTarget);
			var toolType = $el.data("toolType");
			var data = {};
			data[this._toolValueProperty] = toolType;
			data[this._toolLabelProperty] = $el.html();
			this.setViewBag(data);
		},

		_onSelectedToolChanged: function (model, value, options) {
			this.$el.find("[data-role=toolbar-tool]").removeClass("selected");
			this.$el.find("[data-tool-type=" + value + "]").addClass("selected");
		}

	});
});
