var reqwest          = require('reqwest');
var searchDispatcher = require('./dispatchers/search');

var store = {
    timeline: function (query, interval) {
        var path = '/api/timeline?interval=' + encodeURIComponent(interval) + '&query=' + encodeURIComponent(query);
        return reqwest(path);
    }
};

searchDispatcher.register(function (payload) {
    if (payload.actionType === 'search') {
        store
            .timeline(payload.query, payload.interval)
            .then(function (result) {
                searchDispatcher.dispatch({
                    actionType: 'searchResult',
                    query: payload.query,
                    result: result
                });
            });
    }
});

module.exports = store;






