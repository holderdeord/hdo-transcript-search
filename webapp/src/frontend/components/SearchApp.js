import React               from 'react';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';
import keymaster           from 'keymaster';

import Header        from './Header';
import Footer        from './Footer';
import SearchForm    from './SearchForm';
import Timeline      from './Timeline';
import ResultDetails from './ResultDetails';
import SpeechModal   from './SpeechModal';
import DevPanel      from './DevPanel';

class SearchApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            unit: 'pct',
            devPanel: { visible: false},
            orientation: 'horizontal',
            interval: '24w',
            query: ''
        };
    }

    handleAppEvent(payload) {
        switch (payload.action.type) {
            case ActionTypes.SEARCH:
                this.setState({query: payload.action.query, interval: payload.action.interval});
                break;
            case ActionTypes.SEARCH_RESULT:
                this.updateHistoryFromState();
                break;
            case ActionTypes.RESET:
                this.setState({query: ''}, this.updateHistoryFromState.bind(this));
                break;
            default:
                // nothing
        }
    }

    componentDidMount() {
        window.History.Adapter.bind(window, 'statechange', this.handleHistoryChange.bind(this));
        SearchAppDispatcher.register(this.handleAppEvent.bind(this));

        // TODO: use keymaster to provide some instructions on '?'

        keymaster('ctrl+`', () => {
            this.setState({devPanel: {visible: !this.state.devPanel.visible}});
        });

        this.updateStateFromUrl();
    }

    updateHistoryFromState() {
        let path = this.getUrlPathFromState();

        if (window.location.pathname !== path) {
            window.History.pushState(this.state, null, path);
        }
    }

    getUrlPathFromState() {
        let query = encodeURIComponent(this.state.query);
        let unit  = this.state.unit;

        let result = query === '' ? '/' : `/search/${query}/${unit}`;

        return result;
    }

    handleUnitChange(event) {
        let newUnit = event.target.value === '%' ? 'pct' : 'count';

        this.setState({ unit: newUnit }, this.updateHistoryFromState.bind(this));
    }

    handleHistoryChange(event) {
        if (event.state) {
            this.setState(event.state, this.syncState.bind(this));
        }
    }

    updateStateFromUrl() {
        let [,, query, unit] = window.location.pathname.split('/');
        let newState = {query: ''};

        if (unit && unit.length && ['pct', 'count'].indexOf(unit) !== -1) {
            newState.unit = decodeURIComponent(unit);
        }

        if (query && query.length) {
            newState.query = decodeURIComponent(query);
        }

        this.setState(newState, this.syncState.bind(this));
    }

    syncState() {
        if (this.state.query.length) {
            SearchAppDispatcher.handleViewAction({
                type: ActionTypes.SEARCH,
                query: this.state.query,
                interval: this.state.interval
            });
        } else {
            SearchAppDispatcher.handleViewAction({
                type: ActionTypes.RESET
            });
        }
    }

    render() {
        return (
            <div>
                <Header
                    title={document.body.getAttribute('data-title')}
                    description={document.body.getAttribute('data-description')}
                />

                <div className="container">
                    <SearchForm interval={this.state.interval} />

                    <Timeline
                        unit={this.state.unit}
                        onUnitChange={this.handleUnitChange.bind(this)}
                    />

                    <ResultDetails
                        unit={this.state.unit}
                        orientation={this.state.orientation}
                    />

                    <SpeechModal />

                    <Footer />

                    <DevPanel
                        visible={this.state.devPanel.visible}
                        orientation={this.state.orientation}
                        interval={this.state.interval}
                        onOrientationChange={this.handleOrientationChange.bind(this)}
                        onIntervalChange={this.handleIntervalChange.bind(this)}
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
}

module.exports = SearchApp;

