/* global define */

define(["underscore", "backbone"], function (_, Backbone) {

    //-------------------------------------------------------------------------------------------------------------
    // declare the used event types
    var DropZoneViewDragOver = "DropZoneView:DragOver";
    var DropZoneViewDragEnter = "DropZoneView:DragEnter";
    var DropZoneViewDragDrop = "DropZoneView:DragDrop";
    var DropZoneViewDragLeave = "DropZoneView:DragLeave";

    Backbone.DropZoneView = Backbone.View.extend({

        constructor: function (params) {
            //----------------------------------------------------------------------------------------------------------
            // set a control var which is responsible for enabling and disable the drop zone
            this.disableDropZone();

            //----------------------------------------------------------------------------------------------------------
            // bind the context of the event listeners to this
            _.bindAll(this, "_onDragOver", "_onDragEnter", "_onDragDrop", "_onDragLeave");

            //----------------------------------------------------------------------------------------------------------
            // call the super constructor
            Backbone.View.apply(this, arguments);
        },

        enableDropZone: function () {
            //----------------------------------------------------------------------------------------------------------
            // check if the dropzone is already enabled
            if (this.isDropZoneEnabled()) return;

            //----------------------------------------------------------------------------------------------------------
            // set the control var
            this._enabled = true;

            //----------------------------------------------------------------------------------------------------------
            // bind the dragover listener to the event
            this.$el.on("dragover", this._onDragOver);

            //----------------------------------------------------------------------------------------------------------
            // bind the dragenter listener to the event
            this.$el.on("dragenter", this._onDragEnter);

            //-------------------------------------------------------------------------------------------------------------
            // bind the drop listener to the event
            this.$el.on("drop", this._onDragDrop);

            //----------------------------------------------------------------------------------------------------------
            // bind the dragleave listener to the event
            this.$el.on("dragleave", this._onDragLeave);
        },

        disableDropZone: function () {
            //----------------------------------------------------------------------------------------------------------
            // check if the dropzone is already disabled
            if (!this.isDropZoneEnabled()) return;

            //----------------------------------------------------------------------------------------------------------
            // set the control var
            this._enabled = false;

            //----------------------------------------------------------------------------------------------------------
            // unbind the dragover listener from the event
            this.$el.off("dragover", this._onDragOver);

            //----------------------------------------------------------------------------------------------------------
            // unbind the dragenter listener from the event
            this.$el.off("dragenter", this._onDragEnter);

            //-------------------------------------------------------------------------------------------------------------
            // unbind the drop listener to the event
            this.$el.off("drop", this._onDragDrop);

            //----------------------------------------------------------------------------------------------------------
            // unbind the dragleave listener from the event
            this.$el.off("dragleave", this._onDragLeave);
        },

        isDropZoneEnabled: function () {
            return this._enabled;
        },

        remove: function () {
            //-------------------------------------------------------------------------------------------------------------
            // disable dropZone
            this.disableDropZone();

            //----------------------------------------------------------------------------------------------------------
            // call the remove function of the parent class
            Backbone.View.prototype.remove.apply(this, arguments);
        },

        _onDragOver: function (event) {
            //----------------------------------------------------------------------------------------------------------
            // check if the event fits this drop zones requirements
            if (this._validateDragEvent(event)) {
                //------------------------------------------------------------------------------------------------------
                // set the class to drag over
                if (!this.$el.hasClass("drag-over")) this.$el.addClass("drag-over");

                //------------------------------------------------------------------------------------------------------
                // tell any parent view that currently something is dragged over this image anchor view
                this.trigger(DropZoneViewDragOver, this._getDragOverEventParams(event));

                //------------------------------------------------------------------------------------------------------
                // cancel the event
                return false;
            }

            //----------------------------------------------------------------------------------------------------------
            // proceed the event chain
            return true;
        },

        _onDragEnter: function (event) {
            //----------------------------------------------------------------------------------------------------------
            // check if the event fits this drop zones requirements
            if (this._validateDragEvent(event)) {
                //------------------------------------------------------------------------------------------------------
                // tell any parent view that currently something is dragged over this image anchor view
                this.trigger(DropZoneViewDragEnter, this._getDragEnterEventParams(event));

                //------------------------------------------------------------------------------------------------------
                // cancel the event
                return false;
            }

            //----------------------------------------------------------------------------------------------------------
            // proceed the event chain
            return true;
        },

        _onDragDrop: function (event) {
            //-------------------------------------------------------------------------------------------------------------
            // prevent the default drop action
            event.preventDefault();

            //----------------------------------------------------------------------------------------------------------
            // check if the event fits this drop zones requirements
            if (this._validateDragEvent(event)) {
                //------------------------------------------------------------------------------------------------------
                // remove the class to drag over
                this.$el.removeClass("drag-over");

                //------------------------------------------------------------------------------------------------------
                // tell any parent view that currently something is dragged over this image anchor view
                this.trigger(DropZoneViewDragDrop, this._getDragDropEventParams(event));

                //------------------------------------------------------------------------------------------------------
                // cancel the event
                return false;
            }

            //----------------------------------------------------------------------------------------------------------
            // proceed the event chain
            return true;
        },

        _onDragLeave: function (event) {
            //----------------------------------------------------------------------------------------------------------
            // check if the event fits this drop zones requirements
            if (this._validateDragEvent(event)) {
                //------------------------------------------------------------------------------------------------------
                // remove the class to drag over
                this.$el.removeClass("drag-over");

                //------------------------------------------------------------------------------------------------------
                // tell any parent view that currently something is dragged over this image anchor view
                this.trigger(DropZoneViewDragLeave, this._getDragLeaveEventParams(event));

                return false;
            }

            //----------------------------------------------------------------------------------------------------------
            // proceed the event chain
            return true;
        },

        _validateDragEvent: function (event) {
            //----------------------------------------------------------------------------------------------------------
            // validate the drag event to control if the drop zone could be a target to dragged element
            return this.isDropZoneEnabled();
        },

        _getDragOverEventParams: function (event) {
            //----------------------------------------------------------------------------------------------------------
            // override the returned object
            return {};
        },

        _getDragEnterEventParams: function (event) {
            //----------------------------------------------------------------------------------------------------------
            // override the returned object
            return {};
        },

        _getDragDropEventParams: function (event) {
            //----------------------------------------------------------------------------------------------------------
            // override the returned object
            return {};
        },

        _getDragLeaveEventParams: function (event) {
            //----------------------------------------------------------------------------------------------------------
            // override the returned object
            return {}
        }

    });

    //-------------------------------------------------------------------------------------------------------------
    // put the events into an global accessible space
    Backbone.eventTypes = Backbone.eventTypes || {};
    Backbone.eventTypes.DropZoneView = Backbone.eventTypes.DropZoneView || {};
    Backbone.eventTypes.DropZoneView.DragOver = DropZoneViewDragOver;
    Backbone.eventTypes.DropZoneView.DragEnter = DropZoneViewDragEnter;
    Backbone.eventTypes.DropZoneView.DragDrop = DropZoneViewDragDrop;
    Backbone.eventTypes.DropZoneView.DragLeave = DropZoneViewDragLeave;

    return Backbone.DropZoneView;
});