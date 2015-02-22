import BaseStore   from './BaseStore';
import ActionTypes from '../constants/ActionTypes';

class TranscriptStore extends BaseStore {
    constructor() {
        super();
        this._reset();
    }

    // TODO: this doesn't belong here
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
                counts: { total: 0, hits: 0, pct: 0 },
                people: { count: [], pct: []},
                parties: [],
                timeline: []
            }
        };
    }
}

export default new TranscriptStore();

