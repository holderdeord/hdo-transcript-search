import React from 'react';
import TopHits from './TopHits';
import TopListChart from './TopListChart';
import TranscriptStore from '../stores/TranscriptStore';

class ResultDetails extends React.Component {
    constructor(props) {
        super(props);

        this.styles = {
            hidden: {display: 'none'},
            visible: {display: 'block'}
        };

        this.state = this.fetchStateFromStore();
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.handleChange.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.handleChange.bind(this));
    }

    handleChange() {
        this.setState(this.fetchStateFromStore());
    }

    fetchStateFromStore() {
        return {
            query: TranscriptStore.getQuery(),
            result: TranscriptStore.getResult()
        };
    }

    render() {
        return (
            <div style={this.state.query.length ? this.styles.visible : this.styles.hidden}>
                <div className="row result-details">
                    <div className="col-md-6">
                        <TopListChart
                            title="Personer"
                            counts={this.state.result.people[this.props.unit]}
                            unit={this.props.unit}
                            orientation={this.props.orientation}
                        />
                    </div>

                    <div className="col-md-6">
                        <TopListChart
                            title="Partier"
                            counts={this.state.result.parties}
                            unit={this.props.unit}
                            orientation={this.props.orientation}
                        />
                    </div>
                </div>

                <hr />

                <div className="row">
                    <TopHits query={this.state.query} result={this.state.result} />
                </div>
            </div>
        );
    }
}

ResultDetails.propTypes = {
    unit: React.PropTypes.string.isRequired,
    orientation: React.PropTypes.string.isRequired
};

module.exports = ResultDetails;
