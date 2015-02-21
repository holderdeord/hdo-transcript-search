import React from 'react';

var TopHits      = require('./TopHits');
var TopListChart = require('./TopListChart');

class ResultDetails extends React.Component {
    constructor(props) {
        super(props);

        this.styles = {
            hidden: {display: 'none'},
            visible: {display: 'block'}
        };
    }

    render() {
        return (
            <div style={this.props.query.length ? this.styles.visible : this.styles.hidden}>
                <div className="row result-details">
                    <div className="col-md-6">
                        <TopListChart
                            title="Personer"
                            counts={this.props.result.people[this.props.unit]}
                            unit={this.props.unit}
                            orientation={this.props.orientation}
                        />
                    </div>

                    <div className="col-md-6">
                        <TopListChart
                            title="Partier"
                            counts={this.props.result.parties}
                            unit={this.props.unit}
                            orientation={this.props.orientation}
                        />
                    </div>
                </div>

                <hr />

                <div className="row">
                    <TopHits query={this.props.query} result={this.props.result} />
                </div>
            </div>
        );
    }
}

module.exports = ResultDetails;
