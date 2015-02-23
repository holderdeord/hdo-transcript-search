import React               from 'react';
import Chartist            from 'chartist';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';

class BaseChart extends React.Component {
    constructor(props) {
        super(props);
        this.groups = this._blankGroups();
    }

    render() {
        let ratio = this.props.aspectRatio || 'minor-eleventh';

        return (
            <div ref="chart" className={`ct-chart ct-${ratio}`} />
        );
    }

    componentDidMount() {
        this._drawChart(this.props);

        // TODO: get rid of this dependency
        this.dispatchToken = SearchAppDispatcher.register(this._handleAppEvent.bind(this));
    }

    componentWillUnmount() {
        this._detachChart();
        SearchAppDispatcher.unregister(this.dispatchToken);
    }

    componentWillReceiveProps(newProps) {
        this._drawChart(newProps);
    }

    _handleAppEvent(payload) {
        if (payload.action.type === ActionTypes.RESET) {
            this.groups = this._blankGroups();
        }
    }

    _blankGroups() {
        var groups = new Map();

        groups.set('point', new Map());
        groups.set('line', new Map());

        return groups;
    }

    _drawChart(props) {
        let {data, options} = props;
        options = options || {};

        if (this.chart) {
            this.chart.update(data, options, true);
        } else {
            this.chart = new Chartist[props.type](
                React.findDOMNode(this.refs.chart),
                data,
                options
            );

            this._setupAnimation();
        }
    }

    _detachChart() {
        if (this.chart) {
            this.chart.detach();
            this.chart = null;
        }
    }

    _setupAnimation() {
        //
        // http://gionkunz.github.io/chartist-js/examples.html#advanced-smil-animations
        //

        this.chart.on('draw', (data) => {
            let groupKey = data.group._node.className.baseVal;
            let state    = this.groups.get(data.type);
            let seq      = null;
            let duration = 500;

            switch (data.type) {
                case 'point':
                    seq = state.get(groupKey) || 0;
                    seq++;

                    if (seq >= (this.props.data.labels.length * 2)) {
                        // we don't want to animate the same group twice
                        return;
                    }

                    data.element.animate({
                        opacity: {
                            // The delay when we like to start the animation
                            begin: data.index * 80,
                            // Duration of the animation
                            dur: duration,
                            // The value where the animation should start
                            from: 0,
                            // The value where it should end
                            to: 1
                        },
                        x1: {
                            begin: data.index * 80,
                            dur: duration,
                            from: data.x - 100,
                            to: data.x,
                            // You can specify an easing function name or use easing
                            // functions from Chartist.Svg.Easing directly
                            easing: Chartist.Svg.Easing.easeOutQuart
                        }
                    });


                    state.set(groupKey, seq);
                    break;
                case 'line':
                    seq = state.get(groupKey) || 0;
                    seq++;

                    if (seq > (this.props.data.series.length)) {
                        return;
                    }

                    data.element.animate({
                        opacity: {
                            // The delay when we like to start the animation
                            begin: seq * 80,
                            // Duration of the animation
                            dur: duration,
                            // The value where the animation should start
                            from: 0,
                            // The value where it should end
                            to: 1
                        }
                    });

                    state.set(groupKey, seq);
                    break;
                default:
                    // noop
            }
        });

    }
}

BaseChart.propTypes = {
    type: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired,
    options: React.PropTypes.object
};

module.exports = BaseChart;