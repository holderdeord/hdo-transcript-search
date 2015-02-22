import React    from 'react';
import Chartist from 'chartist';

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

    componentWillReceiveProps(props) {
        this._drawChart(props);
    }

    _drawChart(props) {
        let {data,options} = props;
        options = options || {};

        if (this.chart) {
            this.chart.update(data, options, true);
        } else {
            this.chart = new Chartist[props.type](
                React.findDOMNode(this.refs.chart),
                data,
                options
            );
        }
    }

    _detachChart() {
        if (this.chart) {
            this.chart.detach();
            this.chart = null;
        }
    }
}

BaseChart.propTypes = {
    type: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired,
    options: React.PropTypes.object
};

module.exports = BaseChart;