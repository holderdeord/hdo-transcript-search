import reqwest from 'reqwest';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes from '../constants/ActionTypes';

class TranscriptSearchAPI {
    search(query, interval) {
        var path = '/api/search?interval=' + encodeURIComponent(interval) + '&query=' + encodeURIComponent(query);

        return reqwest(path).then(result => {
            SearchAppDispatcher.handleServerAction({
                type: ActionTypes.SEARCH_RESULT,
                query: query,
                result: result
            });
        });
    }
}

module.exports = new TranscriptSearchAPI();
