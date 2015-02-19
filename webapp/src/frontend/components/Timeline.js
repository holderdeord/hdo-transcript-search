import React from 'react';
import moment from 'moment';
moment.locale('nb');

var BaseChart = React.createFactory(require('./BaseChart'));

var {div,select,option} = React.DOM;

class Timeline extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: { labels: [], series: [] }
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            data: {
                labels: props.result.timeline.map(e => moment(e.key).format('MMM YYYY')),
                series: props.result.timeline.length ?
                    [{data: props.result.timeline.map(e => e[props.unit].toFixed(2))}] : []
            }
        });
    }

    render() {
        return div(
            {className: 'row timeline', style: { display: this.props.query.length ? 'block' : 'none' }},
            div(
                null,
                div({className: 'lead pull-right'}, this.props.query),
                this.renderUnitSelect()
            ),
            BaseChart({
                type: 'Line',
                data: this.state.data,
                aspectRatio: 'double-octave',
                options: {
                    low: 0,
                    axisX: {
                        showGrid: false
                    },
                    axisY: {
                        showGrid: true,
                        labelInterpolationFnc: this.formatValue.bind(this)
                    }
                }
            })
        );
    }

    renderUnitSelect() {
        return select(
            {
                checked: this.props.unit,
                onChange: this.props.onUnitChange,
                className: 'input-sm'
            },
            option({value: 'pct'}, 'Prosent av alle innlegg'),
            option({value: 'count'}, 'Antall innlegg')
        );
    }

    formatValue(value) {
        return this.props.unit === 'pct' ? `${value.toFixed(2)}%` : value;
    }
}

Timeline.propTypes = {
    query: React.PropTypes.string.isRequired,
    result: React.PropTypes.object.isRequired,
    unit: React.PropTypes.string.isRequired
};

module.exports = Timeline;
