/*global define*/

define([
	'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	'use strict';

	return Backbone.View.extend({
		tagName: 'input',

		className: '',

		events: {
			"focus": "_onFocus",
			"blur": "_onBlur"
		},

		initialize: function () {
			Backbone.View.prototype.initialize.apply(this, arguments);
		},

		render: function () {
			return this;
		},

		remove: function () {
			this.$el.off();
			Backbone.View.prototype.remove.apply(this, arguments);
		},

		_onFocus: function () {
			var that = this;
			this.$el.on("input", function (event) {
				that._onInput(event);
			});
		},

		_onInput: function (event) {
			this.trigger("input::change", this.$el.val());
		},

		_onBlur: function () {
			this.$el.off("input");
		}
	});

});
