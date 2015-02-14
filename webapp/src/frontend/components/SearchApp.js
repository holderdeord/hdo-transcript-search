import React               from 'react';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';
import TranscriptSearchAPI from '../utils/TranscriptSearchAPI';
import TranscriptStore     from '../stores/TranscriptStore';

var SearchForm    = React.createFactory(require('./SearchForm'));
var Timeline      = React.createFactory(require('./Timeline'));
var ResultDetails = React.createFactory(require('./ResultDetails'));
var SpeechModal   = React.createFactory(require('./SpeechModal'));

var {div} = React.DOM;

// really not sure if this belongs here
SearchAppDispatcher.register(function (payload) {
    console.log(payload);

    switch (payload.action.type) {
    case ActionTypes.SEARCH:
        TranscriptSearchAPI.search(payload.action.query, payload.action.interval);
        break;
    case ActionTypes.SPEECH_CONTEXT:
        TranscriptSearchAPI.speechContext(payload.action.transcript, payload.action.start, payload.action.end);
        break;
    default:
        // nothing
    }
});

class SearchApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.fetchState();
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.handleChange.bind(this));
        // TODO: use keymaster to provide some instructions on '?'
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
                   Timeline(this.state),
                   ResultDetails(this.state),
                   SpeechModal()
                  );
    }
}

module.exports = SearchApp;
