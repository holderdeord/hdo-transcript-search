import React from 'react';
import Colors from '../utils/Colors';
import c3 from 'c3';

var {div,h3} = React.DOM;

class TopListChart extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this._renderChart();
    }

    componentWillUnmount() {
        this._unloadChart();
    }

    render() {
        return div(
            {style: {display: Object.keys(this.props.counts).length ? 'block' : 'none'}},
            h3(null, this.props.title),
            div({ref: 'chart'})
        );
    }

    componentDidUpdate() {
        this._loadData();
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
        var keys = Object.keys(this.props.counts);

        if (keys.length) {
            var cols = [
                ['x'].concat(keys),
                ['Antall innlegg'].concat(keys.map(k => this.props.counts[k]))
            ];

            this.chart.load({columns: cols});
        } else {
            this._unloadChart();
        }
    }
}

TopListChart.propTypes = {
    title: React.PropTypes.string.isRequired,
    counts: React.PropTypes.object.isRequired
};

module.exports = TopListChart;
