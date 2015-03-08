import React               from 'react';
import FluxComponent       from 'flummox/component';

import Intervals           from '../constants/Intervals';
import key                 from 'keymaster';
import Header              from './Header';
import Footer              from './Footer';
import SearchForm          from './SearchForm';
import Timeline            from './Timeline';
import DevPanel            from './DevPanel';
import SharingLinks        from './SharingLinks';
import ResultStats         from './ResultStats';

class SearchApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            unit: 'pct',
            showDevPanel: false,
            showResultDetails: true,
            showHits: false,
            orientation: 'vertical',
            interval: Intervals.YEAR,
            queryType: 'multi'
        };

        this.searchStore = this.props.flux.getStore('search');
        this.searchActions = this.props.flux.getActions('search');
    }

    componentDidMount() {
        // window.History.Adapter.bind(window, 'statechange', this.handleHistoryChange.bind(this));
        window.addEventListener('popstate', this.handleHistoryChange.bind(this));
        this.searchStore.addListener('change', this.updateHistory.bind(this));
        this.registerKeyBindings();
        this.updateFromUrl();
    }

    componentWillUnmount() {
        this.searchStore.removeListener('change', this.updateHistory.bind(this));
        this.unregisterKeyBindings();
    }

    handleHistoryChange(event) {
        // this code currently assumes this is popstate, and that we should load
        // the given state immediately
        if (event.state) {
            this.setState({unit: event.state.unit});
            this.dispatchMultiSearch(event.state.queries);
        }
    }

    updateFromUrl() {
        let [,, unit, query] = window.location.pathname.split('/');

        if (unit && unit.length && ['pct', 'count'].indexOf(unit) !== -1) {
            this.setState({unit: unit});
        }

        if (query && query.length) {
            let queries = decodeURIComponent(query).split('.');

            if (queries.length) {
                this.dispatchMultiSearch(queries);
            } else {
                this.dispatchReset();
            }
        }
    }

    updateHistory() {
        let queries = this.searchStore.getQueries();
        let query   = encodeURIComponent(queries.join('.'));
        let unit    = this.state.unit;
        let path    = query === '' ? '/' : `/search/${unit}/${query}`;

        if (window.location.pathname !== path) {
            window.history.pushState({
                unit: this.state.unit,
                queries: queries
            }, null, path);
        }
    }

    dispatchMultiSearch(queries) {
        this.searchActions.searchMulti(queries, this.state.interval);
    }

    dispatchReset() {
        this.searchActions.reset();
    }

    render() {
        let title = document.body.getAttribute('data-title');
        let desc  = document.body.getAttribute('data-description');
        let fbId  = document.body.getAttribute('data-facebook-app-id');

        return (
            <div>
                <Header title={title} description={desc} />

                <div className="container">
                    <FluxComponent>
                        <SearchForm
                            interval={this.state.interval}
                            queryType={this.state.queryType}
                        />

                        <Timeline
                            unit={this.state.unit}
                            interval={this.state.interval}
                            onUnitChange={this.handleUnitChange.bind(this)}
                        />

                        <ResultStats
                            unit={this.state.unit}
                            orientation={this.state.orientation}
                        />

                        <SharingLinks
                            facebookAppId={fbId}
                        />
                    </FluxComponent>

                    <Footer/>

                    <DevPanel
                        visible={this.state.showDevPanel}
                        orientation={this.state.orientation}
                        interval={this.state.interval}
                        queryType={this.state.queryType}

                        onOrientationChange={this.handleOrientationChange.bind(this)}
                        onIntervalChange={this.handleIntervalChange.bind(this)}
                        onQueryTypeChange={this.handleQueryTypeChange.bind(this)}
                    />
                </div>
            </div>
        );
    }

    handleOrientationChange(event) {
        this.setState({orientation: event.target.value });
    }

    handleIntervalChange(event) {
        this.setState({interval: event.target.value});
    }

    handleUnitChange(event) {
        let newUnit = event.target.value === '%' ? 'pct' : 'count';

        this.setState({ unit: newUnit }, this.updateHistory.bind(this));
    }

    handleQueryTypeChange(event) {
        this.setState({queryType: event.target.value});
    }

    registerKeyBindings() {
        // make sure key bindings work also inside the search field
        key.filter = (event) => {
            var el = event.target || event.srcElement;

            var nonInput = !(
                el.tagName === 'INPUT' ||
                el.tagName === 'SELECT' ||
                el.tagName === 'TEXTAREA'
            );

            return nonInput || el.type === 'search';
        };

        // set up key bindings
        key('ctrl+`', () => {
            this.setState({showDevPanel: !this.state.showDevPanel});
        });

        // TODO: use keymaster to provide some instructions on '?'
    }


    unregisterKeyBindings() {
        key.unbind('ctrl+`');
    }


}

module.exports = SearchApp;

