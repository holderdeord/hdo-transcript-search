import React           from 'react';
import TopHits         from './TopHits';
import TopListChart    from './TopListChart';
import TranscriptStore from '../stores/TranscriptStore';

class ResultDetails extends React.Component {
    constructor(props) {
        super(props);
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
        return {results: TranscriptStore.getResults()};
    }

    render() {
        var lastResult = this.state.results[this.state.results.length - 1];

        if (lastResult) {
             return (
                <div>
                    <div className="row result-details">
                        <div className="col-md-6">
                            <TopListChart
                                title="Personer"
                                counts={lastResult.result.people[this.props.unit]}
                                unit={this.props.unit}
                                orientation={this.props.orientation}
                            />
                        </div>

                        <div className="col-md-6">
                            <TopListChart
                                title="Partier"
                                counts={lastResult.result.parties}
                                unit={this.props.unit}
                                orientation={this.props.orientation}
                            />
                        </div>
                    </div>

                    <hr />

                    <div className="row">
                        <TopHits query={lastResult.query} result={lastResult.result} />
                    </div>
                </div>
            );

        } else {
            return <div />;
        }
    }
}

ResultDetails.propTypes = {
    unit: React.PropTypes.string.isRequired,
    orientation: React.PropTypes.string.isRequired
};

module.exports = ResultDetails;
