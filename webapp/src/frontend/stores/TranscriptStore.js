var SearchAppDispatcher = require('../dispatcher/SearchAppDispatcher');
var ActionTypes         = require('../constants/ActionTypes');

import EventEmitter from 'events';

class TranscriptStore extends EventEmitter {
    constructor() {
        super();
        this.state = {};
        this.dispatchToken = SearchAppDispatcher.register(this._handleAction.bind(this));
    }

    emitChange() {
        this.emit('change');
    }

    addChangeListener(callback) {
        this.on('change', callback);
    }

    removeChangeListener(callback) {
        this.removeListener('change', callback);
    }

    getQuery() {
        return this.state.query;
    }

    getResult() {
        return this.state.result;
    }

    _handleAction(payload) {
        var action = payload.action;

        switch(action.type) {
        case ActionTypes.SEARCH_RESULT:
            this.state.result = action.result;
            this.state.query  = action.query;

            this.emitChange();

            break;

        case ActionTypes.RESET:
            this.state = {};
            this.emitChange();
            break;

        default:
            // do nothing
        }
    }
}

module.exports = new TranscriptStore();
