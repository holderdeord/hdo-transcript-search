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
        }).catch((e) => {
            // TODO: let user know
            console.error(e.toString());
        });
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
            .catch((e) => {
               // TODO: let user know
               console.error(e.toString());
            });
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
            .catch((e) => {
                // TODO: let user know
                console.error(e.toString());
            });
    }

    searchPathFor(query, interval) {
        return `/api/search?interval=${interval}&query=${query}`;
    }
}

export default new TranscriptSearchAPI();
