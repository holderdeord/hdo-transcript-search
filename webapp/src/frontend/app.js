require("./styles/main.less");
require('./styles/chartist.scss');

import React         from 'react';
import Flux          from 'flummox';
import FluxComponent from 'flummox/component';

import SearchActions from './actions/SearchActions';
import SearchStore   from './stores/SearchStore';
import Analytics     from './stores/Analytics';

import SearchApp     from './components/SearchApp';


class SearchAppFlux extends Flux {
    constructor() {
        super();

        this.createActions('search', SearchActions);

        this.createStore('search', SearchStore, this);
        this.createStore('analytics', Analytics, this);
    }
}

let flux = new SearchAppFlux();

React.render(
    <FluxComponent flux={flux}>
        <SearchApp />
    </FluxComponent>,
    document.getElementById('content')
);
