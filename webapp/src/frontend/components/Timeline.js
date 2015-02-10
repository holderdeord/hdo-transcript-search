import React from 'react';
import c3 from 'c3';
import TranscriptStore from '../stores/TranscriptStore';

var div = React.DOM.div;

class Timeline extends React.Component {
    componentDidMount() {
        TranscriptStore.addChangeListener(this._onChange.bind(this));
        this._renderChart();
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this._onChange.bind(this));
        this._unloadChart();
    }

    render() {
        return div({
            className: 'row',
            ref: 'chart'
        });
    }

    _addData(query, data) {
        var dates = [];
        var vals = [];

        data.forEach(e => {
            dates.push(new Date(e.date));
            vals.push(e.pct);
        });

        var cols = [
            ['x'].concat(dates),
            [query].concat(vals)
        ];

        this.chart.load({ columns: cols });
    }

    _onChange() {
        var query = TranscriptStore.getQuery();
        var result = TranscriptStore.getResult();

        if (query && result) {
            this._addData(query, result.counts);
        } else {
            this.chart.unload();
        }
    }

    _renderChart() {
        this.chart = c3.generate({
            bindto: React.findDOMNode(this.refs.chart),
            data: {
                x: 'x',
                columns: [
                    ['x']
                ],
                type: 'spline'
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: "%Y-%m-%d"
                    }
                },
                y: {
                    tick: {
                        format: d => { return d + '%'; }
                    },
                    label: { text: 'Prosent av alle innlegg', position: 'outer-middle' },
                    // max: 100,
                    min: 0,
                    padding: { top: 0, bottom: 0 }
                }
            },
            point: { show: false },
            subchart: { show: false }

            // TODO: find a more HDOish color pattern
            // color: { pattern: ["#111", "#fadd00", "#b8bfcc", "#ccc", "#455068"] }
        });
    }

    _unloadChart() {
        this.chart.unload();
    }
}

module.exports = Timeline;
