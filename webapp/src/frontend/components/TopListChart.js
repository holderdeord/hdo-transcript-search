import React, { PropTypes, Component } from 'react';
import BaseChart from './BaseChart';

export default class TopListChart extends Component {
    static propTypes = {
        title: PropTypes.string,
        subtitle: PropTypes.string,
        counts: PropTypes.array.isRequired,
        unit: PropTypes.string.isRequired,
        orientation: PropTypes.string.isRequired,
        star: PropTypes.bool,
        className: PropTypes.string,
        sort: PropTypes.bool
    };

    render() {
        let unit   = this.props.unit;
        let counts = this.props.counts;

        if (this.props.sort) {
            counts = counts.slice(0).sort((a, b) => a[this.props.unit] - b[this.props.unit]);
        }

        let data = {
            labels: counts.map(e => e.meta && e.meta.party ? `${e.key} (${e.meta.party})` : e.key),
            series: counts.length ? [counts.map(e => e[unit])] : []
        };

        let isHorizontal = this.props.orientation === 'horizontal';

        let chartOptions = {
            chartPadding: {left: 10},
            horizontalBars: isHorizontal,
            reverseData: !isHorizontal,
            axisX: {
                showGrid: isHorizontal,
                labelInterpolationFnc: ::this.formatValue,
                offset: 60
            },
            axisY: {
                labelOffset: { x: 0, y: 6 },
                showGrid: !isHorizontal,
                labelInterpolationFnc: ::this.formatValue,
                offset: 50,
                onlyInteger: this.props.unit === 'count'
            }
        };

        let responsiveOptions = [
            ['screen and (max-width: 599px)', {
                chartPadding: { left: 5 },
                [isHorizontal ? 'axisY' : 'axisX']: {
                    offset: 30,
                    labelInterpolationFnc: d => {
                        let parts = d.split(' ');
                        return parts.length < 2 ? d : parts.slice(parts.length - 2).join(' ');
                    }
                }
            }]
        ];

        let aspectRatios = [
            ['screen', 'minor-sixth']
        ];

        let star = this.props.star ? (<small className="text-muted">&nbsp;*</small>) : null;

        return (
            <div className="top-list-chart">
                <h3 className="text-center hidden-xs">
                    {this.props.subtitle}
                    {star}
                </h3>

                <div className={this.props.className}>
                    <BaseChart
                        type="Bar"
                        data={data}
                        aspectRatios={aspectRatios}
                        tooltipSuffix={this.props.unit === 'pct' ? '%' : null}
                        options={chartOptions}
                        responsiveOptions={responsiveOptions}
                    />
                </div>

            </div>
        );
    }

    formatValue(value) {
        if (typeof value === 'number') {
            return this.props.unit === 'pct' ? `${value.toFixed(2).replace('.', ',')}%` : value;
        } else {
            return value;
        }
    }

}
