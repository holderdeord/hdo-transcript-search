import React       from 'react';
import BaseChart   from './BaseChart';
import TimeUtils   from '../utils/TimeUtils';

const SERIES_CHARS = 'abcdefghijklmno'.split("");

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

        this.searchStore = this.props.flux.getStore('search');
        this.state = this.fetchStateFromStore();
    }

    componentDidMount() {
        this.searchStore.addListener('change', this.handleChange.bind(this));
    }

    componentWillUnmount() {
        this.searchStore.removeListener('change', this.handleChange.bind(this));
    }

    handleChange() {
        this.setState(this.fetchStateFromStore());
    }

    fetchStateFromStore() {
        let queries = [];
        let labels  = [];
        let series  = {pct: [], count: []};

        this.searchStore.eachResult((query, result) => {
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
        if (this.state.queries.length) {
            return (
                <div className="timeline">
                    <div className="controls">
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

                    <div className="card">
                        <div className="row stats">
                            <div className="col-md-12">
                                <BaseChart
                                    type="Line"
                                    data={this.state.data[this.props.unit]}
                                    aspectRatio="double-octave"
                                    options={this.chartOptions}
                                />

                                {this.renderQueries()}
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return <div className="row timeline"></div>;
        }
    }

    renderQueries() {
        // see chartist.scss for colors

        var queries = this.state.queries.map((q, i) => {
            let className = 'hdo-label-' + SERIES_CHARS[i >= SERIES_CHARS.length ? i - SERIES_CHARS.length : i];

            return (
                <li key={q} className={className}>
                    {q}
                </li>
            );
        });

        return (
            <ul className="lead text-center list-inline">{queries}</ul>
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