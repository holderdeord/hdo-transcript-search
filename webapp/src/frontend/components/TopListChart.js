import React from 'react';
import Colors from '../utils/Colors';
import c3 from 'c3';

var {div,h3} = React.DOM;

class TopListChart extends React.Component {

    componentDidUpdate() {
        this._loadData();
    }

    componentDidMount() {
        this._renderChart();
    }

    componentWillUnmount() {
        this._unloadChart();
    }

    render() {
        return div(
            null,
            h3(null, this.props.title),
            div({ref: 'chart'})
        );
    }

    _renderChart() {
        this.chart = c3.generate({
            bindto: React.findDOMNode(this.refs.chart),
            data: {
                x: 'x',
                columns: [],
                type: 'bar'
            },
            transition: { duration: 0 },
            axis: {
                x: { type: 'category', tick: { multiline: false } },
                rotated: true
            },
            color: { pattern: Colors.pattern }
        });
    }

    _unloadChart() {
        this.chart.unload();
        this._renderChart();
    }

    _loadData() {
        let keys = [];
        let values = [];

        this.props.counts.forEach(e => {
            keys.push(e.key);
            values.push(e[this.props.unit]);
        });

        if (keys.length) {
            var cols = [
                ['x'].concat(keys),
                [this._getLabel()].concat(values)
            ];

            this.chart.load({columns: cols});
            setTimeout(this.chart.flush, 300); // hack for https://github.com/masayuki0812/c3/issues/934
        } else {
            this._unloadChart();
        }
    }

    _getLabel() {
        return this.props.unit === 'pct' ? 'Prosent av innlegg' : 'Antall innlegg';
    }

}

TopListChart.propTypes = {
    title: React.PropTypes.string.isRequired,
    counts: React.PropTypes.array.isRequired,
    unit: React.PropTypes.string.isRequired
};

module.exports = TopListChart;
