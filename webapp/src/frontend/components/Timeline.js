import React           from 'react';
import BaseChart       from './BaseChart';
import TranscriptStore from '../stores/TranscriptStore';
import TimeUtils       from '../utils/TimeUtils';

class Timeline extends React.Component {
    constructor(props) {
        super(props);

        this.state = {results: TranscriptStore.getResults()};
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.handleChange.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.handleChange.bind(this));
    }

    handleChange() {
        this.setState({results: TranscriptStore.getResults()});
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

        let unit    = this.props.unit;
        let queries = [];
        let data    = {labels: [], series: []};

        this.state.results.forEach((r) => {
            let result = r.result;
            queries.push(r.query);

            if (!data.labels.length && result.timeline.length) {
                data.labels = result.timeline.map(this.formatLabel.bind(this));
            }

            data.series.push({
                data: result.timeline.map(e => e[unit].toFixed(2))
            });
        });

        let style = {
            display: this.state.results.length ? 'block' : 'none'
        };

        return (
            <div className="row timeline" style={style}>
                <div>
                    <div className="lead pull-right">{queries.join(', ')}</div>
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