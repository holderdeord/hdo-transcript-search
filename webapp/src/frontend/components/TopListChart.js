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
            labels: counts.map(e => e.key),
            series: counts.length ? [counts.map(e => e[unit])] : []
        };

        let isHorizontal = this.props.orientation === 'horizontal';

        let chartOptions = {
            chartPadding: {left: 5},
            horizontalBars: isHorizontal,
            reverseData: !isHorizontal,
            axisX: {
                showGrid: isHorizontal,
                labelInterpolationFnc: this.formatValue.bind(this)
            },
            axisY: {
                showGrid: !isHorizontal,
                labelInterpolationFnc: this.formatValue.bind(this)
            }
        };

        return (
            <div className="top-list-chart">
                <h3>{this.props.title}</h3>
                <small className="text-muted">{this.props.subtitle}</small>

                <BaseChart
                    type="Bar"
                    data={data}
                    aspectRatio="minor-sixth"
                    options={chartOptions}
                />

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
