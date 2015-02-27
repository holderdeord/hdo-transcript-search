import React               from 'react';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';
import Intervals           from '../constants/Intervals';
import TranscriptStore     from '../stores/TranscriptStore';
import key                 from 'keymaster';
import Header              from './Header';
import Footer              from './Footer';
import SearchForm          from './SearchForm';
import Timeline            from './Timeline';
import ResultDetails       from './ResultDetails';
import SpeechModal         from './SpeechModal';
import DevPanel            from './DevPanel';
import SharingLinks        from './SharingLinks';

class SearchApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            unit: 'pct',
            showDevPanel: false,
            showResultDetails: false,
            orientation: 'horizontal',
            interval: Intervals.YEAR,
            queryType: 'multi'
        };
    }

    componentDidMount() {
        // window.History.Adapter.bind(window, 'statechange', this.handleHistoryChange.bind(this));
        window.addEventListener('popstate', this.handleHistoryChange.bind(this));
        TranscriptStore.addChangeListener(this.updateHistory.bind(this));
        this.registerKeyBindings();
        this.updateFromUrl();
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.updateHistory.bind(this));
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
        let queries = TranscriptStore.getQueries();
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
        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.SEARCH_MULTI,
            queries: queries,
            interval: this.state.interval
        });
    }

    dispatchReset() {
        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.RESET
        });
    }

    render() {
        let title = document.body.getAttribute('data-title');
        let desc  = document.body.getAttribute('data-description');
        let fbId  = document.body.getAttribute('data-facebook-app-id');

        return (
            <div>
                <Header title={title} description={desc}>
                    <SharingLinks facebookAppId={fbId} />
                </Header>

                <div className="container">
                    <SearchForm
                        interval={this.state.interval}
                        queryType={this.state.queryType}
                    />

                    <Timeline
                        unit={this.state.unit}
                        interval={this.state.interval}
                        onUnitChange={this.handleUnitChange.bind(this)}
                    />

                    {this.renderResultDetails()}

                    <Footer />

                    <SpeechModal />

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

    renderResultDetails() {
        return this.state.showResultDetails ? (
            <ResultDetails
                unit={this.state.unit}
                orientation={this.state.orientation}
            />
        ) : <div/>;


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

