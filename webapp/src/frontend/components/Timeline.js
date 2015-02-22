import React           from 'react';
import BaseChart       from './BaseChart';
import TranscriptStore from '../stores/TranscriptStore';
import TimeUtils       from '../utils/TimeUtils';

class Timeline extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.fetchStateFromStore();
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.handleChange.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.handleChange.bind(this));
    }

    handleChange() {
        this.setState(this.fetchStateFromStore);
    }

    fetchStateFromStore() {
        return {
            query: TranscriptStore.getQuery(),
            result: TranscriptStore.getResult()
        };
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


        let result = TranscriptStore.getResult();
        let query  = TranscriptStore.getQuery();
        let unit   = this.props.unit;
        let series = [];

        if (result.timeline.length) {
            series = [
                { data: result.timeline.map(e => e[unit].toFixed(2)) }
            ];
        }

        let data = {
            labels: result.timeline.map(this.formatLabel.bind(this)),
            series: series
        };

        let style = {display: query.length ? 'block' : 'none'};

        return (
            <div className="row timeline" style={style}>
                <div>
                    <div className="lead pull-right">{query}</div>
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
                    data={data}
                    aspectRatio="double-octave"
                    options={chartOptions}
                />
            </div>
        );
    }

    formatLabel(d) {
       return TimeUtils.formatIntervalLabel(d.key, this.props.interval);
    }

    formatValue(value) {
        return this.props.unit === 'pct' ? `${value.toFixed(2)}%` : value;
    }
}

Timeline.propTypes = {
    unit         : React.PropTypes.string.isRequired,
    interval     : React.PropTypes.string.isRequired,
    onUnitChange : React.PropTypes.func
};

module.exports = Timeline;