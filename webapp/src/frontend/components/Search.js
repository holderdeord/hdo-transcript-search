import React, { PropTypes, Component } from 'react';

import Intervals from '../constants/Intervals';
import key from 'keymaster';
import SearchForm from './SearchForm';
import Timeline from './Timeline';
import DevPanel from './DevPanel';
import ResultStats from './ResultStats';
import SearchResults from './SearchResults';

export default class Search extends Component {
    static contextTypes = {
        router: PropTypes.object,
        store: PropTypes.object,
    };

    static propTypes = {
        params: PropTypes.shape({
            focused: PropTypes.string,
            unit: PropTypes.string,
            queries: PropTypes.string,
        }),
    };

    state = {
        title: document.body.getAttribute('data-title'),
        desc: document.body.getAttribute('data-description'),
        fbId: document.body.getAttribute('data-facebook-app-id'),
        showDevPanel: false,
        orientation: 'vertical',
        interval: Intervals.YEAR,
    };

    componentDidMount() {
        this.registerKeyBindings();
    }

    componentWillUnmount() {
        this.unregisterKeyBindings();
    }

    render() {
        let focusedIndex = +this.props.params.focused;
        let unit = this.props.params.unit || 'pct';

        return (
            <div>
                <div className="container">
                    <SearchForm
                        interval={this.state.interval}
                        params={this.props.params}
                    />

                    <Timeline
                        unit={unit}
                        interval={this.state.interval}
                        focusedIndex={focusedIndex}
                        onUnitChange={::this.handleUnitChange}
                    />

                    <ResultStats
                        unit={unit}
                        orientation={this.state.orientation}
                        focusedIndex={focusedIndex}
                    />

                    <SearchResults focusedIndex={focusedIndex} />

                    <DevPanel
                        visible={this.state.showDevPanel}
                        orientation={this.state.orientation}
                        interval={this.state.interval}
                        onOrientationChange={::this.handleOrientationChange}
                        onIntervalChange={::this.handleIntervalChange}
                    />
                </div>
            </div>
        );
    }

    handleOrientationChange(event) {
        this.setState({ orientation: event.target.value });
    }

    handleIntervalChange(event) {
        this.setState({ interval: event.target.value });
    }

    handleUnitChange(event) {
        let newUnit = event.target.value === 'Prosent' ? 'pct' : 'count';
        let { queries, focused } = this.props.params;

        this.context.router.transitionTo(`/search/${newUnit}/${queries}/${focused}`);
    }

    registerKeyBindings() {
        // make sure key bindings work also inside the search field
        key.filter = event => {
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
            this.setState({ showDevPanel: !this.state.showDevPanel });
        });

        // TODO: use keymaster to provide some instructions on '?'
    }

    unregisterKeyBindings() {
        key.unbind('ctrl+`');
    }
}
