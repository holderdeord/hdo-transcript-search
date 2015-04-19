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

    componentWillReceiveProps(nextProps) {
        if (!(this.state.focusedQuery &&
                    nextProps.queries &&
                    nextProps.queries.indexOf(this.state.focusedQuery) !== -1)) {
            this.setState({focusedQuery: this.getDefaultFocusedQuery(nextProps)});
        }
    }

    componentDidUpdate() {
        this.updateHistory();
    }

    handleHistoryChange(event) {
        // this code currently assumes this is popstate, and that we should load
        // the given state immediately
        if (event.state) {
            this.setState({
                unit: event.state.unit,
                focusedQuery: event.state.focusedQuery
            });

            this.dispatchSummary(event.state.queries);
        } else {
            this.updateFromUrl();
        }
    }

    updateFromUrl() {
        var parsed = this.parseUrl();

        this.setState({
            unit: parsed.unit,
            focusedQuery: parsed.focusedQuery
        }, () => {
            if (parsed.queries.length) {
                this.dispatchSummary(parsed.queries);
            } else {
                this.dispatchReset();
            }

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
        let path    = query.length === 0 ? '/' : `/search/${unit}/${query}/${focused}`;

        if (window.location.pathname !== path) {
            window.history.pushState({
                unit: this.state.unit,
                queries: this.props.queries,
                focusedQuery: this.state.focusedQuery
            }, null, path);
        }
    }

    dispatchSummary(queries) {
        this.searchActions.summary(queries, this.state.interval);

        var hitsQuery = this.state.focusedQuery || this.getDefaultFocusedQuery({queries: queries});

        if (hitsQuery) {
            this.searchActions.hits(hitsQuery);
        }
    }

    dispatchReset() {
        this.setState({focusedQuery: null}, this.searchActions.reset);
    }

    getDefaultFocusedQuery(props) {
        let pr = props || this.props;
        return pr.queries[pr.queries.length - 1];
    }

    render() {
        return (
            <div>
                <Header title={this.state.title} description={this.state.desc}>
                    <FluxComponent connectToStores={['summary']}>
                        <SharingLinks
                            facebookAppId={this.state.fbId}
                        />
                    </FluxComponent>
                </Header>

                <div className="container">
                    <FluxComponent connectToStores={['summary']}>
                        <SearchForm interval={this.state.interval} />

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
                    </FluxComponent>

                    <FluxComponent connectToStores={['hits']}>
                        <TopHits focusedQuery={this.state.focusedQuery}/>
                    </FluxComponent>

                    <Footer/>

                    <DevPanel
                        visible={this.state.showDevPanel}
                        orientation={this.state.orientation}
                        interval={this.state.interval}

                        onOrientationChange={this.handleOrientationChange.bind(this)}
                        onIntervalChange={this.handleIntervalChange.bind(this)}
                    />
                </div>
            </div>
        );
    }

    handleQueryFocus(query) {
        this.setState({ focusedQuery: query }, () => {
            this.searchActions.hits(query);
        });
    }

    handleOrientationChange(event) {
        this.setState({orientation: event.target.value});
    }

    handleIntervalChange(event) {
        this.setState({interval: event.target.value});
    }

    handleUnitChange(event) {
        let newUnit = event.target.value === '%' ? 'pct' : 'count';

        this.setState({unit: newUnit});
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

