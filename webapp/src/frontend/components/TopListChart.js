import React     from 'react';
import BaseChart from './BaseChart';

class TopListChart extends React.Component {

    render() {
        let unit   = this.props.unit;
        let counts = this.props.counts;

        if (this.props.sort) {
            counts = counts.slice(0).sort((a,b) => a[this.props.unit] - b[this.props.unit]);
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
            onlyInteger: this.props.unit === 'count',
            axisX: {
                showGrid: isHorizontal,
                labelInterpolationFnc: this.formatValue.bind(this),
                offset: 60
            },
            axisY: {
                labelOffset: { x: 0, y: 6 },
                showGrid: !isHorizontal,
                labelInterpolationFnc: this.formatValue.bind(this),
                offset: 50
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
                        aspectRatio="minor-sixth"
                        options={chartOptions}
                        responsiveOptions={responsiveOptions}
                    />
                </div>

            </div>
        );
    }

    formatValue(value) {
        if (typeof value === 'number') {
            return this.props.unit === 'pct' ? `${value.toFixed(2)}%` : value;
        } else {
            return value;
        }
    }

}

TopListChart.propTypes = {
    title: React.PropTypes.string,
    subtitle: React.PropTypes.string,
    counts: React.PropTypes.array.isRequired,
    unit: React.PropTypes.string.isRequired
};

module.exports = TopListChart;
