require("./styles/main.less");
require('./styles/chartist.scss');

import React         from 'react';
import Flux          from 'flummox';
import FluxComponent from 'flummox/component';

import SummaryStore  from './stores/SummaryStore';
import HitsStore     from './stores/HitsStore';
import Analytics     from './stores/Analytics';

import SearchActions from './actions/SearchActions';

import SearchApp     from './components/SearchApp';

class SearchAppFlux extends Flux {
    constructor() {
        super();

        this.createActions('search', SearchActions);

        this.createStore('summary', SummaryStore, this);
        this.createStore('hits', HitsStore, this);
        this.createStore('analytics', Analytics, this);
    }
}

let flux = new SearchAppFlux();

React.render(
    <FluxComponent flux={flux} connectToStores={['summary', 'hits']}>
        <SearchApp />
    </FluxComponent>,
    document.getElementById('content')
);
