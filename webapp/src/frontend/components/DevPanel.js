import React     from 'react';
import Intervals from '../constants/Intervals';

class DevPanel extends React.Component {
    render() {
        return (
            <div className={`dev-panel row ${this.props.visible ? '' : 'hide'}`}>
                <div className="col-md-6 col-md-offset-4">
                    <div>
                        TopListChart orientation:

                        <select
                            onChange={this.props.onOrientationChange}
                            value={this.props.orientation}>
                                <option value='horizontal'>horizontal</option>
                                <option value='vertical'>vertical</option>
                        </select>
                    </div>

                    <div>
                        Timeline interval:

                        <select
                            name='interval'
                            value={this.props.interval}
                            onChange={this.props.onIntervalChange}>
                                <option value={Intervals.MONTH}>month</option>
                                <option value={Intervals.THREE_MONTHS}>3 months</option>
                                <option value={Intervals.SIX_MONTHS}>6 months</option>
                                <option value={Intervals.YEAR}>year</option>
                        </select>
                    </div>

                    <div>
                        Query type:

                        <select
                            name='queryType'
                            value={this.props.queryType}
                            onChange={this.props.onQueryTypeChange}>
                                <option value='single'>single</option>
                                <option value='multi'>multi</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }

}

DevPanel.propTypes = {
    visible: React.PropTypes.bool.isRequired,
    interval: React.PropTypes.string.isRequired,
    queryType: React.PropTypes.string.isRequired
};

module.exports = DevPanel;