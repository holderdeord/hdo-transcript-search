import React               from 'react';
import Chartist            from 'chartist';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';

class BaseChart extends React.Component {
    render() {
        let ratio = this.props.aspectRatio || 'minor-eleventh';

        return (
            <div ref="chart" className={`ct-chart ct-${ratio}`} />
        );
    }

    componentDidMount() {
        this._drawChart(this.props);
    }

    componentWillUnmount() {
        this._detachChart();
    }

    componentDidUpdate() {
        this._drawChart(this.props);
    }

    _drawChart(props) {
        let {data, options} = props;
        options = options || {};

        if (this.chart) {
            setTimeout(() => this.chart.update(data, options, true), 0);
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
        var groups = new Map();

        SearchAppDispatcher.register((payload) => {
            if (payload.action.type === ActionTypes.RESET) {
                groups.clear();
            }
        });

        //
        // http://gionkunz.github.io/chartist-js/examples.html#advanced-smil-animations
        //

        this.chart.on('draw', (data) => {
            let groupKey = data.group._node.className.baseVal;

            switch (data.type) {
                case 'point':
                    let seq = groups.set(groupKey, (groups.get(groupKey) || 0) + 1).get(groupKey);

                    if (seq >= (this.props.data.labels.length * 2)) {
                        // we don't want to animate the same group twice
                        return;
                    }

                    data.element.animate({
                        opacity: {
                            // The delay when we like to start the animation
                            begin: data.index * 80,
                            // Duration of the animation
                            dur: 500,
                            // The value where the animation should start
                            from: 0,
                            // The value where it should end
                            to: 1
                        },
                        x1: {
                            begin: data.index * 80,
                            dur: 500,
                            from: data.x - 100,
                            to: data.x,
                            // You can specify an easing function name or use easing
                            // functions from Chartist.Svg.Easing directly
                            easing: Chartist.Svg.Easing.easeOutQuart
                        }
                    });
                    break;
                case 'line':
                    data.element.animate({
                        opacity: {
                            // The delay when we like to start the animation
                            begin: seq * 80,
                            // Duration of the animation
                            dur: 500,
                            // The value where the animation should start
                            from: 0,
                            // The value where it should end
                            to: 1
                        }
                    });
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