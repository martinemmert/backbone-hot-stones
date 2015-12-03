/**
 * @author:  Martin Emmert
 * @created: 13.03.14 - 14:08
 *
 * @package:
 * @name:
 */
define(["underscore", "backbone"], function (_, Backbone) {

    //-------------------------------------------------------------------------------------------------------------
    // define available events
    var ExecuteCommand = "CommandHub:ExecuteCommand";
    var CommandExecuted = "CommandHub:CommandExecuted";

    //
    //-------------------------------------------------------------------------------------------------------------
    // HIDDEN COMMAND CLASS ONLY AVAILABLE THROUGH COMMAND HUB
    //-------------------------------------------------------------------------------------------------------------
    //

    var Command = function (commandMethod, commandContext) {
        this.initialize(commandMethod, commandContext);
    };

    _.extend(Command.prototype, Backbone.Events, {
        initialize: function (commandMethod, commandContext) {
            this._commandMethod = commandMethod;
            this._commandContext = commandContext;
        },

        execute: function (params, callback, context) {
            var result = this._commandMethod.call(this._commandContext, params) || {};
            this.trigger(CommandExecuted, this, result, callback, context);
        },

        destroy: function () {
            this._commandMethod = null;
            this._commandContext = null;
        }
    });

    //
    //-------------------------------------------------------------------------------------------------------------
    // COMMAND HUB
    //-------------------------------------------------------------------------------------------------------------
    //

    var CommandHub = function () {
        this.initialize();
    };

    _.extend(CommandHub.prototype, {
        initialize: function () {
            //----------------------------------------------------------------------------------------------------------
            // bind the execute event to the listener
            Backbone.bind(ExecuteCommand, this._onExecuteCommand, this);

            //-------------------------------------------------------------------------------------------------------------
            // hash-map for the mapped commands
            this._commands = {};
        },

        addCommand: function (commandName, commandMethod, context) {
            //-------------------------------------------------------------------------------------------------------------
            // check if the command name is already registered, if true throw an error
            if (this._commands[commandName] != undefined) {
                throw new Error("A command is with the name " + commandName + " is already mapped!");
            }

            this._commands[commandName] = {method: commandMethod, context: context};
        },

        removeCommand: function (commandName) {
            if (this._commands[commandName]) {
                this._commands[commandName].method = null;
                this._commands[commandName].context = null;
                delete this._commands[commandName];
            }
        },

        _onExecuteCommand: function (commandName, params, callback, context) {
            if (this._commands[commandName] != undefined) {
                //DEBUG::START
                console.info("CommandHub >> " + commandName + " > params, callback, context", params, callback != null, context);
                //DEBUG::END
                var command = new Command(this._commands[commandName].method, this._commands[commandName].context);
                command.once(CommandExecuted, this._onCommandExecuted, this);
                command.execute(params, callback, context);
            }
        },

        _onCommandExecuted: function (command, commandResult, callback, context) {
            command.destroy();
            if (callback) callback.call(context, commandResult);
        }

    });

    //-------------------------------------------------------------------------------------------------------------
    // put the events into an global accessible space
    Backbone.eventTypes = Backbone.eventTypes || {};
    Backbone.eventTypes.CommandHub = Backbone.eventTypes.CommandHub || {};
    Backbone.eventTypes.CommandHub.ExecuteCommand = ExecuteCommand;

    return Backbone.CommandHub = CommandHub;

});