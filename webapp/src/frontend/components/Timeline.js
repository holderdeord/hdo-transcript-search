import React from 'react';
import c3 from 'c3';
import Colors from '../utils/Colors';

var {div,select,option} = React.DOM;

class Timeline extends React.Component {
    render() {
        return div(
            {className: 'row timeline', style: { display: this.props.query.length ? 'block' : 'none' }},
            this.renderUnitSelect(),
            div({ref: 'chart'})
        );
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
                        format: this.formatTick.bind(this)
                    },
                    min: 0,
                    padding: { top: 0, bottom: 0 }
                }
            },
            transition: { duration: 0 },
            point: { show: true },
            subchart: { show: false },
            color: { pattern: Colors.pattern }
        });
    }

    componentDidUpdate() {
        if (this.props.query.length && this.props.result) {
            this._addData(this.props.query, this.props.result.timeline);
        } else {
            this.chart.unload();
        }
    }

    getLabel() {
        return this.props.unit === 'pct' ? 'Prosent av alle innlegg' : 'Antall innlegg';
    }

    renderUnitSelect() {
        return select(
            {checked: this.props.unit, onChange: this.props.onUnitChange},
            option({value: 'pct'}, 'Prosent av alle innlegg'),
            option({value: 'count'}, 'Antall innlegg')
        );
    }

    formatTick(d) {
        return this.props.unit === 'pct' ? `${d.toFixed(2)}%` : d;
    }

    _addData(query, data) {
        var dates = [];
        var vals = [];

        data.forEach(e => {
            dates.push(new Date(e.key));
            vals.push(e[this.props.unit]);
        });

        var cols = [
            ['x'].concat(dates),
            [query].concat(vals)
        ];

        this.chart.load({
            columns: cols
        });
    }

    _unloadChart() {
        this.chart.unload();
    }
}

Timeline.propTypes = {
    query: React.PropTypes.string.isRequired,
    result: React.PropTypes.object.isRequired,
    unit: React.PropTypes.string.isRequired
};

module.exports = Timeline;
