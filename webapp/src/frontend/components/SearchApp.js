var React       = require('react');
var div         = React.DOM.div;
var hr          = React.DOM.hr;
var SearchForm  = React.createFactory(require('./SearchForm'));
var Timeline    = React.createFactory(require('./Timeline'));
var ResultStats = React.createFactory(require('./ResultStats'));

var SearchAppDispatcher = require('../dispatcher/SearchAppDispatcher');
var ActionTypes         = require('../constants/ActionTypes');
var TranscriptSearchAPI = require('../utils/TranscriptSearchAPI');

// really not sure if this belongs here
SearchAppDispatcher.register(function (payload) {
    if (payload.action.type === ActionTypes.SEARCH) {
        TranscriptSearchAPI.search(payload.action.query, payload.action.interval);
    }
});

module.exports = React.createClass({
    render: function () {
        return div({},
                   SearchForm(),
                   hr(),
                   Timeline(),
                   hr(),
                   ResultStats()
                  );
    }
});