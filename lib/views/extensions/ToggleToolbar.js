define(['underscore', 'jquery', 'backbone'], function (_, $, Backbone) {

	// create Backbone.Directives namespace if not set
	if (!Backbone.ViewExtensions) {
		Backbone.ViewExtensions = {};
	}

	// create directive

	Backbone.ViewExtensions.ToggleToolbar = function ($el) {
		// create a capsuled scope
		return new (function ($target) {
			// save the context
			var that = this;

			// save the reference to the target and the html element
			this.$html = $("html");
			this.$el = $target;

			// get the needed references
			this.$toolbarToggler = this.$el.find("[data-role=toggle-toolbar-toggler]");
			this.$toolbarBody = this.$el.find("[data-role=toggle-toolbar-body]");

			// reference for the animation frame requests
			this.animReq = null;

			// initial state
			this.$toolbarBody.css("display", "none");

			this.$toolbarBody.on("hidden", function () {
				that.$el.css("visibility", "hidden");
			});

			this.$toolbarBody.on("visible", function () {
				that.$el.css("visibility", "visible");
			});

			// apply some logic
			this.$toolbarToggler.click(function (event) {

				that.$toolbarToggler
						.css("display", "none")
						.addClass("is-invisible");

				that.$toolbarBody.css("display", "inline-block");

				that.$html.on("click", that._outsideClickHandler);

				window.cancelRequestAnimFrame(that.animReq);

				that.animReq = window.requestAnimFrame(function () {
					that.$toolbarBody.addClass("is-visible");
				});

				event.preventDefault();
				return false;
			});

			this._outsideClickHandler = function (event) {

				that.$html.off("click", that._outsideClickHandler);

				that.$toolbarBody
						.css("display", "none")
						.removeClass("is-visible");

				that.$toolbarToggler.css("display", "inline-block");

				window.cancelRequestAnimFrame(that.animReq);

				that.animReq = window.requestAnimFrame(function () {
					that.$toolbarToggler.removeClass("is-invisible");
				});

				event.preventDefault();
				return false;
			};

			this.destroy = function () {

				window.cancelRequestAnimationFrame(this.animReq);
				this.animReq = null;

				this.$toolbarToggler.off();
				this.$html.off("click", this._outsideClickHandler);

				this.$html = null;
				this.$el = null;
				this.$toolbarBody = null;
				this.$toolbarToggler = null;
			}

		})($el);
	};

});