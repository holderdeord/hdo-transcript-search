import React           from 'react';
import BaseChart       from './BaseChart';
import TranscriptStore from '../stores/TranscriptStore';
import TimeUtils       from '../utils/TimeUtils';

class Timeline extends React.Component {
    constructor(props) {
        super(props);

        this.chartOptions = {
            low: 0,
            axisX: {
                showGrid: false
            },
            axisY: {
                showGrid: true,
                labelInterpolationFnc: this.formatValue.bind(this)
            }
        };


        this.state = this.fetchStateFromStore();
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.handleChange.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.handleChange.bind(this));
    }

    handleChange() {
        this.setState(this.fetchStateFromStore());
    }

    fetchStateFromStore() {
        let queries = [];
        let labels  = [];
        let series  = {pct: [], count: []};

        TranscriptStore.eachResult((query, result) => {
            queries.push(query);

            if (!labels.length && result.timeline.length) {
                labels = result.timeline.map(this.formatLabel.bind(this));
            }

            series.pct.push({ data: result.timeline.map(e => e.pct.toFixed(2)) });
            series.count.push({ data: result.timeline.map(e => e.count) });
        });

        return {
            queries: queries,
            data: {
                pct: { labels: labels, series: series.pct },
                count: { labels: labels, series: series.count }
            }
        };
    }

    render() {
        let style = {
            display: this.state.queries.length ? 'block' : 'none'
        };

        return (
            <div className="row timeline" style={style}>
                <div>
                    <div className="lead pull-right">{this.state.queries.join(', ')}</div>
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
                    data={this.state.data[this.props.unit]}
                    aspectRatio="double-octave"
                    options={this.chartOptions}
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