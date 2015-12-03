define([
	'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	'use strict';

	var __emptyOptions = {};

	return Backbone.View.extend({

		initialize: function (options) {
			options = options || {};
			this._viewBag = options.viewBag || new Backbone.Model();
			Backbone.View.prototype.initialize.apply(this, arguments);
		},

		/**
		 * returns the whole viewBag Model or a specific property if name is given
		 * @param property
		 * @returns {*}
		 */
		getViewBag: function (property) {
			if (property) {
				return this._viewBag.get(property);
			}
			return this._viewBag;
		},

		/**
		 * sets one or more properties on the view bag
		 * if the first parameter is a hash map of key:values pairs they will all be set on the viewBag and the param
		 * value will be omitted
		 * @param property
		 * @param [value]
		 */
		setViewBag: function (property, value, options) {
			if (_.isObject(property)) {
				this._viewBag.set(property, options || __emptyOptions);
			}
			else {
				this._viewBag.set(property, value, options || __emptyOptions);
			}
		}

	});


});