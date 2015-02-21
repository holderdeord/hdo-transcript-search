import React from 'react';
import moment from 'moment';
moment.locale('nb');
import TranscriptStore from '../stores/TranscriptStore';

var BaseChart = require('./BaseChart');

class Timeline extends React.Component {
    constructor(props) {
        super(props);

        this.state = {data: {labels: [], series: []}, query: ''};

    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.handleChange.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.handleChange.bind(this));
    }

    handleChange() {
        let result = TranscriptStore.getResult();
        let unit   = this.props.unit;
        let series = [];

        if (result.timeline.length) {
            series = [{data: result.timeline.map(e => e[unit].toFixed(2))}];
        }

        this.setState({
            data: {
                labels: result.timeline.map(e => moment(e.key).format('MMM YYYY')),
                series: series
            },
            query: TranscriptStore.getQuery()
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

        let style = {display: this.state.query.length ? 'block' : 'none'};

        return (
            <div className="row timeline" style={style}>
                <div>
                    <div className="lead pull-right">{this.state.query}</div>
                        <div className="btn-group btn-toggle"
                             onClick={this.props.onUnitChange}>
                            <input
                                type="button"
                                value="%"
                                className={`btn ${this.props.unit === 'pct' ? 'btn-primary' : 'btn-default'}`}
                            />

                            <input
                                type="button"
                                value="#"
                                className={`btn ${this.props.unit === 'count' ? 'btn-primary' : 'btn-default'}`}
                            />
                        </div>
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

    formatValue(value) {
        return this.props.unit === 'pct' ? `${value.toFixed(2)}%` : value;
    }
}

Timeline.propTypes = {
    unit: React.PropTypes.string.isRequired,
    onUnitChange: React.PropTypes.func
};

module.exports = Timeline;
