var SearchAppDispatcher = require('../dispatcher/SearchAppDispatcher');
var ActionTypes         = require('../constants/ActionTypes');
var assign              = require('object-assign');
var EventEmitter        = require('events').EventEmitter;

var _state = {};

var TranscriptStore = assign({}, EventEmitter.prototype, {
    emitChange: function () {
        this.emit('change');
    },

    addChangeListener: function (callback) {
        this.on('change', callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener('change', callback);
    },

    getQuery: function () {
        return _state.query;
    },

    getResult: function () {
        return _state.result;
    }
});

TranscriptStore.dispatchToken = SearchAppDispatcher.register(function (payload) {
    var action = payload.action;

    switch(action.type) {
        case ActionTypes.SEARCH_RESULT:
          _state.result = action.result;
          _state.query  = action.query;

          TranscriptStore.emitChange();

          break;

        case ActionTypes.RESET:
          _state = {};
          TranscriptStore.emitChange();
          break;

        default:
          // do nothing
    }
});

module.exports = TranscriptStore;
