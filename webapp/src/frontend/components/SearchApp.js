import React               from 'react';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';
import TranscriptSearchAPI from '../utils/TranscriptSearchAPI';
import TranscriptStore     from '../stores/TranscriptStore';

var Header        = React.createFactory(require('./Header'));
var SearchForm    = React.createFactory(require('./SearchForm'));
var Timeline      = React.createFactory(require('./Timeline'));
var ResultDetails = React.createFactory(require('./ResultDetails'));
var SpeechModal   = React.createFactory(require('./SpeechModal'));
var DevPanel      = React.createFactory(require('./DevPanel'));

var {div} = React.DOM;

// really not sure if this belongs here
SearchAppDispatcher.register(function (payload) {
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

        this.state             = this.fetchStateFromStore();
        this.state.unit        = 'pct';
        this.state.devPanel    = { visible: true };
        this.state.orientation = 'horizontal';
        this.state.interval    = '24w';
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.handleChange.bind(this));
        // TODO: use keymaster to provide some instructions on '?'
        // TODO: use keymaster to toggle dev panel

        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.SEARCH,
            query: this.initialQuery(),
            interval: this.state.interval
        });
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.handleChange.bind(this));
    }

    handleChange() {
        this.setState(this.fetchStateFromStore());
    }

    handleUnitChange(event) {
        this.setState({unit: event.target.value});
    }

    fetchStateFromStore() {
        return {
            query: TranscriptStore.getQuery(),
            result: TranscriptStore.getResult()
        };
    }

    initialQuery() {
        let match = window.location.pathname.match(/search\/(.+?)(\/|$)/);
        return match ? decodeURIComponent(match[1]) : 'skatt';
    }

    render() {
        return div({},
            Header(),
            div({className: 'container'},
                SearchForm({
                    interval: this.state.interval
                }),
                Timeline({
                    unit: this.state.unit,
                    query: this.state.query,
                    result: this.state.result,
                    onUnitChange: this.handleUnitChange.bind(this)
                }),
                ResultDetails({
                    unit: this.state.unit,
                    query: this.state.query,
                    result: this.state.result,
                    orientation: this.state.orientation
                }),
                SpeechModal(),
                DevPanel({
                    visible: this.state.devPanel.visible,
                    orientation: this.state.orientation,
                    interval: this.state.interval,
                    onOrientationChange: this.handleOrientationChange.bind(this),
                    onIntervalChange: this.handleIntervalChange.bind(this)
                })
            )
        );
    }

    handleOrientationChange(event) {
        this.setState({
            orientation: event.target.value
        });
    }

    handleIntervalChange(event) {
        this.setState({
            interval: event.target.value
        });
    }
}

module.exports = SearchApp;
