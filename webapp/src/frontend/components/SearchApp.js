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
import TopHits             from './TopHits';

class SearchApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: document.body.getAttribute('data-title'),
            desc: document.body.getAttribute('data-description'),
            fbId: document.body.getAttribute('data-facebook-app-id'),
            unit: 'pct',
            showDevPanel: false,
            orientation: 'vertical',
            interval: Intervals.YEAR,
            queryType: 'multi',
            focusedQuery: null
        };

        this.searchActions = this.props.flux.getActions('search');
    }

    componentDidMount() {
        window.addEventListener('popstate', this.handleHistoryChange.bind(this));
        this.registerKeyBindings();
        this.updateFromUrl();
    }

    componentWillUnmount() {
        this.unregisterKeyBindings();
    }

    componentWillReceiveProps(props) {
        this.setState({
            focusedQuery: this.getDefaultFocusedQuery(props)
        }, this.updateHistory.bind(this));
    }

    handleHistoryChange(event) {
        // this code currently assumes this is popstate, and that we should load
        // the given state immediately
        if (event.state) {
            this.setState({
                unit: event.state.unit,
                focusedQuery: event.state.focusedQuery
            });
            this.dispatchMultiSearch(event.state.queries);
        } else {
            this.updateFromUrl();
        }
    }

    updateFromUrl() {
        var parsed = this.parseUrl();

        if (parsed.queries.length) {
            this.dispatchMultiSearch(parsed.queries);
        } else {
            this.dispatchReset();
        }

        this.setState({
            unit: parsed.unit,
            focusedQuery: parsed.focusedQuery
        });
    }

    parseUrl() {
        let parsed = {};

        let [,, unit, query, focused] =
            window.location.pathname.split('/');

        if (unit && unit.length && ['pct', 'count'].indexOf(unit) !== -1) {
            parsed.unit = unit;
        }

        if (focused && focused.length) {
            parsed.focusedQuery = decodeURIComponent(focused.trim());
        }

        if (query && query.length) {
            parsed.queries = decodeURIComponent(query).split('.');
        }

        return parsed;
    }

    updateHistory() {
        let query   = encodeURIComponent(this.props.queries.join('.'));
        let focused = encodeURIComponent(this.state.focusedQuery);

        let unit    = this.state.unit;
        let path    = query.length === 0 ? '/' : `/search/${unit}/${query}`;

        if (focused.length !== 0 && this.state.focusedQuery !== this.getDefaultFocusedQuery()) {
            path = `${path}/${focused}`;
        }

        if (window.location.pathname !== path) {
            window.history.pushState({
                unit: this.state.unit,
                queries: this.props.queries,
                focusedQuery: this.state.focusedQuery
            }, null, path);
        }
    }

    dispatchMultiSearch(queries) {
        this.searchActions.searchMulti(queries, this.state.interval);
    }

    dispatchReset() {
        this.searchActions.reset();
    }

    getDefaultFocusedQuery(props) {
        let pr = props || this.props;
        return pr.queries[pr.queries.length - 1];
    }

    render() {
        return (
            <div>
                <Header title={this.state.title} description={this.state.desc}>
                    <FluxComponent connectToStores={['search']}>
                        <SharingLinks
                            facebookAppId={this.state.fbId}
                        />
                    </FluxComponent>
                </Header>

                <div className="container">
                    <FluxComponent connectToStores={['search']}>
                        <SearchForm
                            interval={this.state.interval}
                            queryType={this.state.queryType}
                        />

                        <Timeline
                            unit={this.state.unit}
                            interval={this.state.interval}
                            focusedQuery={this.state.focusedQuery}
                            onUnitChange={this.handleUnitChange.bind(this)}
                            onQueryFocus={this.handleQueryFocus.bind(this)}
                        />

                        <ResultStats
                            focusedQuery={this.state.focusedQuery}
                            unit={this.state.unit}
                            orientation={this.state.orientation}
                        />

                        <TopHits focusedQuery={this.state.focusedQuery}/>
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

    handleQueryFocus(query) {
        this.setState({ focusedQuery: query }, this.updateHistory.bind(this));
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

