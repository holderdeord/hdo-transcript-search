import React       from 'react';
import BaseChart   from './BaseChart';
import TimeUtils   from '../utils/TimeUtils';
import Colors      from '../utils/Colors';

class Timeline extends React.Component {
    constructor(props) {
        super(props);

        this.chartOptions = {
            chartPadding: { left: 10 },
            low: 0,
            fullWidth: false,
            axisX: {
                showGrid: false,
                labelOffset: { x: -67, y: 8 },
            },
            axisY: {
                labelOffset: { x: 0, y: 4 },
                showGrid: true,
                labelInterpolationFnc: this.formatValue.bind(this)
            }
        };

        this.state = this.fetchStateFrom({results: []});
    }

    componentWillReceiveProps(props) {
        this.setState(this.fetchStateFrom(props));
    }

    fetchStateFrom(props) {
        let queries = [];
        let labels  = [];
        let series  = {pct: [], count: []};

        props.results.forEach((r) => {
            let query = r.query;
            let result = r.result;

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
                        <div className="row result-box">
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
            let className = Colors.colorAt(i);
            let query;


            if (this.props.focusedQuery === q) {
                query = <span className={className} style={{textDecoration: 'underline'}}>{q}</span>;
            } else {
                query = <a onClick={this.handleFocusQuery.bind(this)}>
                    <span className={className}>{q}</span>
                </a>;
            }

            return (
                <li key={q}>{query}</li>
            );
        });

        return (
            <ul className="queries-selector" style={{paddingTop: '1.5rem'}}>
                {queries}
            </ul>
        );
    }

    formatLabel(d) {
       return TimeUtils.formatIntervalLabel(d.key, this.props.interval);
    }

    formatValue(value) {
        return this.props.unit === 'pct' ? `${value.toFixed(2)}%` : value;
    }

    handleFocusQuery(event) {
        if (this.props.onQueryFocus) {
            this.props.onQueryFocus(event.target.firstChild.data);
        }
    }
}

Timeline.propTypes = {
    unit         :  React.PropTypes.string.isRequired,
    interval     :  React.PropTypes.string.isRequired,
    focusedQuery :  React.PropTypes.string,
    onUnitChange :  React.PropTypes.func,
    onQueryFocused: React.PropTypes.func
};

module.exports = Timeline;