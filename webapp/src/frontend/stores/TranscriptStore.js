import BaseStore from './BaseStore';
import ActionTypes from '../constants/ActionTypes';

class TranscriptStore extends BaseStore {
    constructor() {
        super();
        this._reset();
    }

    getQuery() {
        return this.state.query;
    }

    getResult() {
        return this.state.result;
    }

    handleAction(payload) {
        var action = payload.action;

        switch(action.type) {
        case ActionTypes.SEARCH_RESULT:
            this.state.result = action.result;
            this.state.query  = action.query;

            this.emitChange();

            break;

        case ActionTypes.RESET:
            this._reset();
            this.emitChange();
            break;

        default:
            // do nothing
        }
    }

    _reset() {
        this.state = {
            query: '',
            result: {
                hits: [],
                totalCount: 0,
                hitCount: 0,
                partyCounts: {},
                peopleCounts: {}
            }
        };
    }
}

module.exports = new TranscriptStore();
