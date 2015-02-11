import React from 'react';
import TranscriptStore from '../stores/TranscriptStore';
import Colors from '../utils/Colors';
import c3 from 'c3';

var {div,h3} = React.DOM;

class TopListChart extends React.Component {

    constructor(props) {
        super(props);
        this.state = this._getCounts();
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.onChange.bind(this));
        this._renderChart();
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.onChange.bind(this));
        this._unloadChart();
    }

    onChange() {
        this.setState(this._getCounts());
    }

    render() {
        return div(
            null,
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
        var keys = Object.keys(this.state.counts);

        if (keys.length) {
            var cols = [
                ['x'].concat(keys),
                ['Antall innlegg'].concat(keys.map(k => this.state.counts[k]))
            ];

            this.chart.load({columns: cols});
        } else {
            this._unloadChart();
        }
    }

    _getCounts() {
        var result = TranscriptStore.getResult();

        return {
            counts: result[this.props.resultKey]
        };
    }
}

TopListChart.propTypes = {
    title: React.PropTypes.string,
    key: React.PropTypes.string
};

module.exports = TopListChart;
