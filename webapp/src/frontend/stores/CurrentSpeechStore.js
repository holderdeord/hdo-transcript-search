import BaseStore           from './BaseStore';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';

class CurrentSpeechStore extends BaseStore {
    constructor() {
        super();
        this.dispatchToken = SearchAppDispatcher.register(this.handleAction.bind(this));
        this.hits = [];
    }

    get() {
        return this.hits;
    }

    handleAction(payload) {
        var action = payload.action;

        switch(action.type) {
        case ActionTypes.SPEECH_CONTEXT_RESULT:
            this.hits = action.result;
            this.emitChange();

            break;

        case ActionTypes.RESET:
            this.hits = [];
            this.emitChange();
            break;

        default:
        }

    }

}

export default new CurrentSpeechStore();
