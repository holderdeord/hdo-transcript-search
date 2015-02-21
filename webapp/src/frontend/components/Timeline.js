import React from 'react';
import moment from 'moment';
moment.locale('nb');

var BaseChart = require('./BaseChart');

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
        let chartOptions = {
            low: 0,
            axisX: {
                showGrid: false
            },
            axisY: {
                showGrid: true,
                labelInterpolationFnc: this.formatValue.bind(this)
            }
        };

        let style = {display: this.props.query.length ? 'block' : 'none'};

        return (
            <div className="row timeline" style={style}>
                <div>
                    <div className="lead pull-right">{this.props.query}</div>
                    {this.renderUnitSelect()}
                </div>

                <BaseChart
                    type="Line"
                    data={this.state.data}
                    aspectRatio="double-octave"
                    options={chartOptions}
                />
            </div>
        );
    }

    renderUnitSelect() {
        let pctClass = `btn ${this.props.unit === 'pct' ? 'btn-primary' : 'btn-default'}`;
        let countClass = `btn ${this.props.unit === 'count' ? 'btn-primary' : 'btn-default'}`;

        return (
          <div className="btn-group btn-toggle" onClick={this.props.onUnitChange}>
            <input
                type="button"
                value="%"
                className={pctClass}
            />

            <input
                type="button"
                value="#"
                className={countClass}
            />
          </div>
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
