import BaseStore   from './BaseStore';
import ActionTypes from '../constants/ActionTypes';

class TranscriptStore extends BaseStore {
    constructor() {
        super();
        this._reset();
    }

    getResults() {
        return this.results;
    }

    getLastResult() {
        return this.results.slice(-1)[0];
    }

    getQueries() {
        return this.results.map(e => e.query);
    }

    getJoinedQuery() {
        return this.getQueries().join(', ');
    }

    hasQuery(q) {
        return this.getQueries().indexOf(q) !== -1;
    }

    eachResult(callback) {
        this.results.forEach((r) => callback(r.query, r.result));
    }

    handleAction(payload) {
        var action = payload.action;

        switch(action.type) {
        case ActionTypes.SEARCH_RESULT:
            this.results.push({
                query: action.query,
                result: action.result
            });

            this.emitChange();
            break;
        case ActionTypes.SEARCH_MULTI_RESULT:
            this.results = action.results;

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
        this.results = [];
    }
}

export default new TranscriptStore();

