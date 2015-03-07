import Promise             from 'bluebird';
import reqwest             from 'reqwest';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';

class TranscriptSearchAPI {
    search(query, interval) {
        var path = this.searchPathFor(query, interval);

        return reqwest(path).then(result => {
            SearchAppDispatcher.handleServerAction({
                type: ActionTypes.SEARCH_RESULT,
                query: query,
                result: result
            });
        }).catch(this._logError);
    }

    searchMultiple(queries, interval) {
        return Promise.map(queries, q => {
            return reqwest(this.searchPathFor(q, interval)).then((r) => {
                return {query: q, result: r};
            });
        })
            .then(results => {
                SearchAppDispatcher.handleServerAction({
                    type: ActionTypes.SEARCH_MULTI_RESULT,
                    results: results
                });
            })
            .catch(this._logError);
    }

    speechContext(transcriptId, start, end) {
        var path = `/api/context/${transcriptId}/${start}/${end}`;

        return reqwest(path)
            .then(result => {
                SearchAppDispatcher.handleServerAction({
                    type: ActionTypes.SPEECH_CONTEXT_RESULT,
                    result: result
                });
            })
            .catch(this._logError);
    }

    searchPathFor(query, interval) {
        return `/api/search?interval=${interval}&query=${query}`;
    }

    _logError(e) {
        console.error(e.message, e.stack);
    }
}

export default new TranscriptSearchAPI();