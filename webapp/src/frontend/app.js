require("./styles/main.less");
require('./styles/chartist.scss');

import React         from 'react';
import Flux          from 'flummox';
import FluxComponent from 'flummox/component';
import Router        from 'react-router';
import SummaryStore  from './stores/SummaryStore';
import HitsStore     from './stores/HitsStore';
import SpeechStore   from './stores/SpeechStore';
import Analytics     from './stores/Analytics';
import SearchActions from './actions/SearchActions';
import routes        from './routes';

class AppFlux extends Flux {
    constructor() {
        super();

        this.createActions('search', SearchActions);

        this.createStore('summary', SummaryStore, this);
        this.createStore('hits', HitsStore, this);
        this.createStore('speech', SpeechStore, this)
        this.createStore('analytics', Analytics, this);

        this.searchActions = this.getActions('search');
    }

    executeSearch(queries) {
        this.searchActions.summary(queries);
        this.searchActions.hits(queries);
    }

    executeReset() {
        this.searchActions.reset();
    }

    executeSpeechContext(...args) {
        this.searchActions.speechContext(...args);
    }
}

let flux = new AppFlux();

Router.run(routes, Router.HistoryLocation, function (Handler, state) {
    React.render(
        <FluxComponent flux={flux}>
            <Handler {...state} />
        </FluxComponent>,
        document.getElementById('content')
    );

    if (state.params.queries && state.params.queries.length) {
        flux.executeSearch(state.params.queries.split('.'));
    } else if (state.params.transcript && state.params.order) {
        flux.executeSpeechContext(state.params.transcript, +state.params.order);
    } else {
        flux.executeReset();
    }
});

