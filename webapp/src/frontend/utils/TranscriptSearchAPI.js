import reqwest from 'reqwest';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes from '../constants/ActionTypes';

class TranscriptSearchAPI {
    search(query, interval) {
        var path = `/api/search?interval=${interval}&query=${query}`;

        return reqwest(path).then(result => {
            SearchAppDispatcher.handleServerAction({
                type: ActionTypes.SEARCH_RESULT,
                query: query,
                result: result
            });
        });
    }

    speechContext(transcriptId, start, end) {
        var path = `/api/context/${transcriptId}/${start}/${end}`;

        return reqwest(path).then(result => {
            SearchAppDispatcher.handleServerAction({
                type: ActionTypes.SPEECH_CONTEXT_RESULT,
                result: result
            });
        });
    }
}

module.exports = new TranscriptSearchAPI();
