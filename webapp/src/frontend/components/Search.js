import React               from 'react';
import assign              from 'react/lib/Object.assign';
import FluxComponent       from 'flummox/component';

import Intervals           from '../constants/Intervals';
import key                 from 'keymaster';
import SearchForm          from './SearchForm';
import Timeline            from './Timeline';
import DevPanel            from './DevPanel';
import ResultStats         from './ResultStats';
import TopHits             from './TopHits';

class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: document.body.getAttribute('data-title'),
            desc: document.body.getAttribute('data-description'),
            fbId: document.body.getAttribute('data-facebook-app-id'),
            showDevPanel: false,
            orientation: 'vertical',
            interval: Intervals.YEAR
        };
    }

    componentDidMount() {
        this.registerKeyBindings();
    }

    componentWillUnmount() {
        this.unregisterKeyBindings();
    }

    componentDidUpdate() {
    }

    componentWillRecieveProps() {
    }

    render() {
        let focusedIndex = +this.props.params.focused;
        let unit = this.props.params.unit || 'pct';

        return (
            <div>
                <div className="container">
                    <FluxComponent connectToStores={['summary']}>
                        <SearchForm
                            interval={this.state.interval}
                            params={this.props.params}
                        />

                        <Timeline
                            unit={unit}
                            interval={this.state.interval}
                            focusedIndex={focusedIndex}
                            onUnitChange={this.handleUnitChange.bind(this)}
                        />

                        <ResultStats
                            unit={unit}
                            orientation={this.state.orientation}
                            focusedIndex={focusedIndex}
                        />
                    </FluxComponent>

                    <FluxComponent connectToStores={['hits']}>
                        <TopHits focusedIndex={focusedIndex}/>
                    </FluxComponent>

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

    handleOrientationChange(event) {
        this.setState({orientation: event.target.value});
    }

    handleIntervalChange(event) {
        this.setState({interval: event.target.value});
    }

    handleUnitChange(event) {
        let newUnit = event.target.value === '%' ? 'pct' : 'count';
        this.context.router.transitionTo('search', assign({}, this.props.params, {unit: newUnit}));
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

Search.contextTypes = {
    router: React.PropTypes.func
};

module.exports = Search;

