define([
	'jquery',
	'underscore',
	'backbone',
	'views/AbstractView'
], function ($, _, Backbone, AbstractView) {
	'use strict';

	return AbstractView.extend({

		initialize: function (options) {
			this._childViews = {};
			this._childViewRegions = {};
			AbstractView.prototype.initialize.call(this, options);
		},

		appendChildView: function (region, view, replace) {
			if (this._childViewRegions[region]) {
				if (replace) {
					view.setElement(this._childViewRegions[region]);
				}
				else {
					this._childViewRegions[region].append(view.$el);
				}

				this._childViews[region] = view;
			}
		},

		removeChildView: function (view) {
			for (var v in this._childViews) {
				if (this._childViews[v] === view) {
					this._childViews[v].remove();
					this._childViews[v] = null;
				}
			}
		},

		render: function () {
			AbstractView.prototype.render.call(this);
			this._registerViewRegions();
			this._hookAfterRegisterViewRegions();
			return this;
		},

		remove: function () {
			this._clearViewRegions();
			this._clearChildViews();
			AbstractView.prototype.remove.call(this);
		},

		_hookAfterRegisterViewRegions: function () {

		},

		_getViewRegion: function (region) {
			return this._childViewRegions[region];
		},

		_registerViewRegions: function () {
			// save the context
			var that = this;

			// find the view regions
			this.$el.find("[data-view-region]").each(function (index, element) {
				var $element = $(element),
				    region   = $element.data("viewRegion");

				that._childViewRegions[region] = $element;
			});
		},

		_clearViewRegions: function () {
			for (var region in this._childViewRegions) {
				this._childViewRegions[region] = null;
			}
		},

		_clearChildViews: function () {
			for (var view in this._childViews) {
				this._childViews[view].remove();
				this._childViews[view] = null;
			}
		}

	});

});