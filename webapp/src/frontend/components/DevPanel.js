import React     from 'react';
import Intervals from '../constants/Intervals';

class DevPanel extends React.Component {
    render() {
        if (this.props.visible) {
            return (
                <div className='dev-panel row'>
                    <div className="col-md-4 text-right">
                        <div>
                            <span style={{paddingRight: '1rem'}}>TopListChart orientation:</span>

                            <select
                                onChange={this.props.onOrientationChange}
                                value={this.props.orientation}>
                                    <option value='horizontal'>horizontal</option>
                                    <option value='vertical'>vertical</option>
                            </select>
                        </div>

                        <div>
                            <span style={{paddingRight: '1rem'}}>Timeline interval:</span>

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
                    </div>

                    <div className="col-md-4 text-left">
                        <div>
                            <label>
                                <span style={{paddingRight: '1rem'}}>Query type:</span>


                                <select
                                    name='queryType'
                                    value={this.props.queryType}
                                    onChange={this.props.onQueryTypeChange}>
                                        <option value='single'>single</option>
                                        <option value='multi'>multi</option>
                                </select>
                            </label>
                        </div>
                    </div>

                </div>
            );
        } else {
            return <div />;
        }
    }

}

DevPanel.propTypes = {
    visible: React.PropTypes.bool.isRequired,
    interval: React.PropTypes.string.isRequired,
    queryType: React.PropTypes.string.isRequired
};

module.exports = DevPanel;