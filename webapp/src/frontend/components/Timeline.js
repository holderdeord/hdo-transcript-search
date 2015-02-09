import React from 'react';
import c3 from 'c3';
import TranscriptStore from '../stores/TranscriptStore';

var div = React.DOM.div;

class Timeline extends React.Component {
    componentDidMount() {
        this.renderChart();
        TranscriptStore.addChangeListener(this.onChange.bind(this));
    }

    componentWillUnmount() {
        this.chart.unload();
        TranscriptStore.removeChangeListener(this.onChange.bind(this));
    }

    render() {
        return div({
            className: 'row',
            ref: 'chart'
        });
    }

    // helpers

    addData(query, data) {
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

    onChange() {
        var query = TranscriptStore.getQuery();
        var result = TranscriptStore.getResult();

        if (query && result) {
            this.addData(query, result.counts);
        } else {
            this.chart.unload();
        }
    }

    renderChart() {
        this.chart = c3.generate({
            bindto: this.refs.chart.getDOMNode(),
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
                    // max: 100,
                    min: 0,
                    padding: { top: 0, bottom: 0 }
                }
            },
            point: { show: false },
            subchart: { show: false }

            //        color: { pattern: ["#111", "#fadd00", "#b8bfcc", "#ccc", "#455068"] }
        });
    }
}

module.exports = Timeline;
