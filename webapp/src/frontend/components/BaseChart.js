import React    from 'react';
import Chartist from 'chartist';

class BaseChart extends React.Component {
    constructor(props) {
        super(props);
        this.groups = this._blankGroups();
        this.state = {
            tooltip: null,
            aspectRatio: ''
        };
    }

    render() {
        let tooltip = null;

        if (this.state.tooltip) {
            tooltip = (
                <div className="chart-tooltip" style={this.state.tooltip.style}>
                    {this.state.tooltip.text}
                </div>
            );
        }

        return (
            <div>
                <div ref="chart"
                    className={`ct-chart ct-${this.state.aspectRatio}`}
                    onMouseOver={this._handleMouseOver.bind(this)}
                    onMouseOut={this._handleMouseOut.bind(this)}
                />

                {tooltip}
            </div>
        );
    }

    componentWillMount() {
        this._updateAspectRatio();
    }

    componentDidMount() {
        this._drawChart(this.props);
        window.addEventListener('resize', this._handleResize.bind(this));
    }

    componentWillUnmount() {
        this._detachChart();
        window.removeEventListener('resize', this._handleResize.bind(this));
    }

    componentWillReceiveProps(newProps) {
        this._updateAspectRatio();
        this._drawChart(newProps);
    }

    _handleResize() {
        this._updateAspectRatio();
    }

    _updateAspectRatio() {
        let mapping = this.props.aspectRatios || [];

        for (let i = 0; i < mapping.length; i++) {
            let [query, ratio] = mapping[i];

            if (window.matchMedia(query).matches) {
                this.setState({aspectRatio: ratio});
                break;
            }
        }
    }

    _blankGroups() {
        var groups = new Map();

        groups.set('point', new Map());
        groups.set('line', new Map());

        return groups;
    }

    _handleMouseOver(event) {
        let e   = event.nativeEvent;
        let val = e.srcElement.getAttribute('ct:value');

        if (val) {
            val = (+val);

            this.setState({
                tooltip: {
                    text: Math.floor(val) === val ? val : val.toFixed(2),
                    style: {
                        left: (e.offsetX || e.originalEvent.layerX) - 15,
                        top: (e.offsetY || e.originalEvent.layerY) - 38
                    }
                }
            });
        }
    }

    _handleMouseOut(event) {
        if (event.nativeEvent.srcElement.getAttribute('ct:value')) {
            this.setState({tooltip: null});
        }
    }

    _drawChart(props) {
        let {data, options, responsiveOptions} = props;
        options = options || {};
        responsiveOptions = responsiveOptions || {};

        if (this.chart) {
            this.chart.update(data, options, true);
        } else {
            this.chart = new Chartist[props.type](
                this._getDOMNode(),
                data,
                options,
                responsiveOptions
            );

            this._setupAnimation();
        }
    }

    _detachChart() {
        if (this.chart) {
            this.chart.detach();
            this.chart = null;
        }

        this.groups = this._blankGroups();
    }

    _getDOMNode() {
        return React.findDOMNode(this.refs.chart);
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
                case 'bar':
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
    options: React.PropTypes.object,
    aspectRatios: React.PropTypes.array
};

module.exports = BaseChart;