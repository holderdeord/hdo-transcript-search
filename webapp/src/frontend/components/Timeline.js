import React from 'react';
import c3 from 'c3';
import Colors from '../utils/Colors';

var div = React.DOM.div;

class Timeline extends React.Component {
    render() {
        return div({
            className: 'row timeline',
            ref: 'chart',
            style: { display: this.props.query.length ? 'block' : 'none' }
        });
    }

    componentDidMount() {
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
                        format: d => d + '%'
                    },
                    label: { text: 'Prosent av alle innlegg', position: 'outer-middle' },
                    // max: 100,
                    min: 0,
                    padding: { top: 0, bottom: 0 }
                }
            },
            point: { show: false },
            subchart: { show: false },
            color: { pattern: Colors.pattern }
        });
    }

    componentDidUpdate() {
        if (this.props.query.length && this.props.result) {
            this._addData(this.props.query, this.props.result.counts);
        } else {
            this.chart.unload();
        }
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

    _unloadChart() {
        this.chart.unload();
    }
}

Timeline.propTypes = {
    query: React.PropTypes.string.isRequired,
    result: React.PropTypes.object.isRequired
};

module.exports = Timeline;
