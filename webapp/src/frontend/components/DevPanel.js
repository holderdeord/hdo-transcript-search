import React, { PropTypes } from 'react';
import Intervals from '../constants/Intervals';

export default class DevPanel extends React.Component {
    static propTypes = {
        visible: PropTypes.bool.isRequired,
        interval: PropTypes.string.isRequired,
        onOrientationChange: PropTypes.func.isRequired,
        onIntervalChange: PropTypes.func.isRequired,
        orientation: PropTypes.string.isRequired
    };

    render() {
        if (!this.props.visible) {
            return null;
        }

        return (
            <div className="dev-panel row">
                <div className="col-md-4 text-right">
                    <div>
                        <span style={{paddingRight: '1rem'}}>TopListChart orientation:</span>

                        <select
                            onChange={this.props.onOrientationChange}
                            value={this.props.orientation}>
                                <option value="horizontal">horizontal</option>
                                <option value="vertical">vertical</option>
                        </select>
                    </div>

                    <div>
                        <span style={{paddingRight: '1rem'}}>Timeline interval:</span>

                        <select
                            name="interval"
                            value={this.props.interval}
                            onChange={this.props.onIntervalChange}>
                                <option value={Intervals.MONTH}>month</option>
                                <option value={Intervals.THREE_MONTHS}>3 months</option>
                                <option value={Intervals.SIX_MONTHS}>6 months</option>
                                <option value={Intervals.YEAR}>year</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }

}

