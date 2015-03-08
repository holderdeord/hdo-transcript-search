import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';
import ServerFacade        from '../utils/ServerFacade';

class TranscriptSearchAPI {
    constructor() {
        this.server = new ServerFacade();
    }

    search(query, interval) {
        return this.server.search(query, interval).then(result => {
            SearchAppDispatcher.handleServerAction({
                type: ActionTypes.SEARCH_RESULT,
                query: query,
                result: result
            });
        }).catch(this._logError);
    }

    searchMultiple(queries, interval) {
        return this.server.searchMultiple(queries, interval)
            .then(results => {
                SearchAppDispatcher.handleServerAction({
                    type: ActionTypes.SEARCH_MULTI_RESULT,
                    results: results
                });
            })
            .catch(this._logError);
    }

    _logError(e) {
        console.error(e.message, e.stack);
    }
}

export default new TranscriptSearchAPI();