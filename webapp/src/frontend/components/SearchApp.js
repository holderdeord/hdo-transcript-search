import React from 'react';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';
import TranscriptSearchAPI from '../utils/TranscriptSearchAPI';

var SearchForm    = React.createFactory(require('./SearchForm'));
var Timeline      = React.createFactory(require('./Timeline'));
var ResultDetails = React.createFactory(require('./ResultDetails'));

var div           = React.DOM.div;
var hr            = React.DOM.hr;

// really not sure if this belongs here
SearchAppDispatcher.register(function (payload) {
    if (payload.action.type === ActionTypes.SEARCH) {
        TranscriptSearchAPI.search(payload.action.query, payload.action.interval);
    }
});

class SearchApp extends React.Component {
    render() {
        return div(null,
                   SearchForm(),
                   hr(),
                   Timeline(),
                   hr(),
                   ResultDetails()
                  );
    }
}

module.exports = SearchApp;
