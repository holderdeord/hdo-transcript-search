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
        var firstResult = this.state.results[0];

        if (firstResult) {
            let peopleSubtitle = this.props.unit === 'pct' ? 'Prosent av representantens innlegg' : 'Antall innlegg';
            let partySubtitle = this.props.unit === 'pct' ? 'Prosent av partiets innlegg': 'Antall innlegg';

             return (
                <div>
                    <div className="row result-details">
                        <div className="col-md-6">
                            <TopListChart
                                title={`Hvem snakker mest om ${firstResult.query}?`}
                                subtitle={peopleSubtitle}
                                counts={firstResult.result.people[this.props.unit]}
                                unit={this.props.unit}
                                orientation={this.props.orientation}
                            />
                        </div>

                        <div className="col-md-6">
                            <TopListChart
                                title={`Hvilke partier snakker mest om ${firstResult.query}?`}
                                subtitle={partySubtitle}
                                counts={firstResult.result.parties}
                                unit={this.props.unit}
                                orientation={this.props.orientation}
                            />
                        </div>
                    </div>

                    {this.renderHits(firstResult)}
                </div>
            );

        } else {
            return <div />;
        }
    }

    renderHits(lastResult) {
        return this.props.showHits ? (
            <div className="row">
               <hr />
               <TopHits query={lastResult.query} result={lastResult.result} />
            </div>
        ) : <div/>;
    }
}

ResultDetails.propTypes = {
    unit: React.PropTypes.string.isRequired,
    orientation: React.PropTypes.string.isRequired,
    showHits: React.PropTypes.bool.isRequired
};

module.exports = ResultDetails;
