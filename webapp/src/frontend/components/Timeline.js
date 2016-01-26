import React, { PropTypes, Component } from 'react';
import BaseChart from './BaseChart';
import TimeUtils from '../utils/TimeUtils';
import Colors    from '../utils/Colors';
import {Link}    from 'react-router';
import key       from 'keymaster';
import {connect} from 'react-redux';

@connect(({summary: {results}}) => ({results}))
export default class Timeline extends Component {
    static propTypes = {
        unit:  PropTypes.string.isRequired,
        interval:  PropTypes.string.isRequired,
        onUnitChange:  PropTypes.func,
        focusedIndex: PropTypes.number.isRequired
    };

    chartOptions = {
        chartPadding: { left: 10, top: 35 },
        low: 0,
        fullWidth: false,
        axisX: {
            showGrid: false,
            labelOffset: { x: -15, y: 8 }
        },
        axisY: {
            labelOffset: { x: -5, y: 6 },
            showGrid: true,
            labelInterpolationFnc: ::this.formatValue
        }
    };

    responsiveOptions = [
        ['screen and (max-width: 599px)', {
            chartPadding: { left: 5 },
            fullWidth: true,
            axisX: {
                labelOffset: { x: 0, y: 0 },
                labelInterpolationFnc: d => d.slice(2, 4)
            }
        }]
    ];

    aspectRatios = [
        ['screen and (max-width: 992px)', 'minor-sixth'],
        ['screen', 'double-octave']
    ];

    state = this.fetchStateFrom({results: []});

    componentWillReceiveProps(props) {
        this.setState(this.fetchStateFrom(props));
    }

    componentDidMount() {
        key('ctrl+1', ::this.setPercent);
        key('ctrl+2', ::this.setAbsolute);
    }

    componentWillUnmount() {
        key.unbind('ctrl+1');
        key.unbind('ctrl+2');
    }

    setPercent() {
        this.props.onUnitChange({target: {value: 'Prosent'}});
    }

    setAbsolute() {
        this.props.onUnitChange({target: {value: 'Absolutt'}});
    }

    fetchStateFrom(props) {
        let queries = [];
        let labels  = [];
        let series  = {pct: [], count: []};
        let results = props.results || [];

        results.forEach((r) => {
            let query = r.query;
            let result = r.result;

            queries.push(query);

            if (!labels.length && result.timeline.length) {
                labels = result.timeline.map(::this.formatLabel);
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
            this.chartOptions.axisY.onlyInteger = this.props.unit === 'count';

            return (
                <div className="timeline">
                    <div className="controls">
                        <div className="btn-group btn-toggle"
                             onClick={this.props.onUnitChange}>
                            <input
                                type="button"
                                value="Prosent"
                                className={`btn ${this.props.unit === 'pct' ? 'btn-primary' : 'btn-default'}`}
                            />

                            <input
                                type="button"
                                value="Absolutt"
                                className={`btn ${this.props.unit === 'count' ? 'btn-primary' : 'btn-default'}`}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="row result-box result-box-header">
                            <div className="col-md-12">
                                <h4 className="text-center">
                                    Forekomsten av «{this.state.queries.join(', ')}» over tid
                                </h4>
                            </div>
                        </div>

                        <div className="row result-box">
                            <div className="col-md-12 col-xs-12">
                                <BaseChart
                                    type="Line"
                                    aspectRatios={this.aspectRatios}
                                    tooltipSuffix={this.props.unit === 'pct' ? '%' : null}
                                    data={this.state.data[this.props.unit]}
                                    options={this.chartOptions}
                                    responsiveOptions={this.responsiveOptions}
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

            if (+this.props.focusedIndex === i) {
                query = <span className={className} style={{fontWeight: '700'}}>{q}</span>;
            } else {
                let queryPath = this.state.queries.join('.');
                let unit = this.props.unit;
                let focused = i;

                query = (
                    <Link to={`/search/${unit}/${queryPath}/${focused}`}>
                        <span className={className}>{q}</span>
                    </Link>
                );
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
}
