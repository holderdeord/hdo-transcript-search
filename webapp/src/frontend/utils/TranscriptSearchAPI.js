var reqwest             = require('reqwest');
var SearchAppDispatcher = require('../dispatcher/SearchAppDispatcher');
var ActionTypes         = require('../constants/ActionTypes');

class TranscriptSearchAPI {
    search(query, interval) {
        var path = '/api/search?interval=' + encodeURIComponent(interval) + '&query=' + encodeURIComponent(query);

        return reqwest(path).then(function (result) {
            SearchAppDispatcher.handleServerAction({
                type: ActionTypes.SEARCH_RESULT,
                query: query,
                result: result
            });
        });
    }
}

module.exports = new TranscriptSearchAPI();
