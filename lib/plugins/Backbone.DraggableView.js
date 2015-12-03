/* global define */

define(["underscore", "backbone"], function (_, Backbone) {

    //-------------------------------------------------------------------------------------------------------------
    // define the events
    var DraggableViewStartDrag = "DraggableView:StartDrag";
    var DraggableViewEndDrag = "DraggableView:EndDrag";

    Backbone.DraggableView = Backbone.View.extend({

        constructor: function (params) {
            //----------------------------------------------------------------------------------------------------------
            // bind the context of the event listeners to this
            _.bindAll(this, "_onDragStart", "_onDragEnd");

            //----------------------------------------------------------------------------------------------------------
            // call the super constructor
            Backbone.View.apply(this, arguments);
        },

        enableDragging: function () {
            //----------------------------------------------------------------------------------------------------------
            // check if dragging is already enabled
            if (this.isDraggingEnabled()) return;

            //-------------------------------------------------------------------------------------------------------------
            // enable the dragging
            this._enabled = true;

            //----------------------------------------------------------------------------------------------------------
            // make the views root element draggable
            this.$el.attr("draggable", true);

            //----------------------------------------------------------------------------------------------------------
            // bind the dragstart listener to the event
            this.$el.on("dragstart", this._onDragStart);

            //----------------------------------------------------------------------------------------------------------
            // bind the dragend listener to the event
            this.$el.on("dragend", this._onDragEnd);
        },

        disableDragging: function () {
            //----------------------------------------------------------------------------------------------------------
            // check if dragging is already disabled
            if (!this.isDraggingEnabled()) return;

            //-------------------------------------------------------------------------------------------------------------
            // disable the dragging
            this._enabled = false;

            //----------------------------------------------------------------------------------------------------------
            // make the views root element non-draggable
            this.$el.attr("draggable", false);

            //----------------------------------------------------------------------------------------------------------
            // unbind the dragstart listener to the event
            this.$el.off("dragstart", this._onDragStart);

            //----------------------------------------------------------------------------------------------------------
            // unbind the dragend listener to the event
            this.$el.off("dragend", this._onDragEnd);
        },

        isDraggingEnabled: function () {
            return this._enabled && this.$el.attr("draggable") == "true";
        },

        remove: function () {
            //----------------------------------------------------------------------------------------------------------
            // disable the dragging first
            this.disableDragging();

            //----------------------------------------------------------------------------------------------------------
            // call the remove function of the parent class
            Backbone.View.prototype.remove.apply(this, arguments);
        },

        _onDragStart: function (event) {
            //------------------------------------------------------------------------------------------------------
            // add the dragged class to the views root element
            this.$el.addClass("dragged");

            //------------------------------------------------------------------------------------------------------
            // tell any parent view that this view is dragged
            this.trigger(Backbone.eventTypes.DraggableView.StartDrag, this._getDragStartEventParams(event));
        },

        _onDragEnd: function (event) {
            //------------------------------------------------------------------------------------------------------
            // remove the dragged class from the views root element
            this.$el.removeClass("dragged");

            //------------------------------------------------------------------------------------------------------
            // tell any parent view that this view is not dragged anymore
            this.trigger(Backbone.eventTypes.DraggableView.EndDrag, this._getDragEndEventParams(event));
        },

        _getDragStartEventParams: function () {
            //----------------------------------------------------------------------------------------------------------
            // override the returned object
            return {};
        },

        _getDragEndEventParams: function () {
            //----------------------------------------------------------------------------------------------------------
            // override the returned object
            return {};
        }

    });

    //-------------------------------------------------------------------------------------------------------------
    // put the events into an global accessible space
    Backbone.eventTypes = Backbone.eventTypes || {};
    Backbone.eventTypes.DraggableView = Backbone.eventTypes.DraggableView || {};
    Backbone.eventTypes.DraggableView.StartDrag = DraggableViewStartDrag;
    Backbone.eventTypes.DraggableView.EndDrag = DraggableViewEndDrag;

    return Backbone.DraggableView;
});