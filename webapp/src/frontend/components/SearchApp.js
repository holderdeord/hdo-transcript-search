import React               from 'react';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';
import TranscriptSearchAPI from '../utils/TranscriptSearchAPI';
import TranscriptStore     from '../stores/TranscriptStore';

var SearchForm    = React.createFactory(require('./SearchForm'));
var Timeline      = React.createFactory(require('./Timeline'));
var ResultDetails = React.createFactory(require('./ResultDetails'));

var {div,hr} = React.DOM;

// really not sure if this belongs here
SearchAppDispatcher.register(function (payload) {
    if (payload.action.type === ActionTypes.SEARCH) {
        TranscriptSearchAPI.search(payload.action.query, payload.action.interval);
    }
});

class SearchApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.fetchState();
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.handleChange.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.handleChange.bind(this));
    }

    handleChange() {
        this.setState(this.fetchState());
    }

    fetchState() {
        return {
            query: TranscriptStore.getQuery(),
            result: TranscriptStore.getResult()
        };
    }

    render() {
        return div(null,
                   SearchForm(),
                   hr(),
                   Timeline(this.state),
                   hr(),
                   ResultDetails(this.state)
                  );
    }
}

module.exports = SearchApp;
