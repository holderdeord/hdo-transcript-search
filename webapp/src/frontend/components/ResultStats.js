import React           from 'react';
import TopListChart    from './TopListChart';
import Parties         from '../constants/Parties';
import ImageUtils      from '../utils/ImageUtils';

class ResultStats extends React.Component {
    constructor(props) {
        super(props);

        this.searchStore = this.props.flux.getStore('search');

        this.state = {
            parties: [],
            people: [],
            query: ''
        };
    }

    componentDidMount() {
        this.searchStore.addListener('change', this.handleChange.bind(this));
    }

    componentWillUnmount() {
        this.searchStore.removeListener('change', this.handleChange.bind(this));
    }

    handleChange() {
        let parties = [];
        let people  = [];
        let query   = '';

        let result = this.searchStore.getLastResult();

        if (result) {
            people = result.result.people;
            parties = result.result.parties;
            query = result.query;
        }

        this.setState({
            query: query,
            parties: parties,
            people: people,
            topParties: this.topParties(parties)
        });
    }

    render() {
        if (this.state.query.length) {
            return (
                <div className="card">
                    {this.renderPartyStats()}
                    <div className="divider" />
                    {this.renderPeopleStats()}
                </div>
            );
        } else {
            return <div />;
        }
    }

    renderPartyStats() {
        return (
            <div className="row stats">
                <div className="col-md-6">
                    <TopListChart
                        subtitle="Partier"
                        orientation={this.props.orientation}
                        unit={this.props.unit}
                        counts={this.state.parties.sort((a, b) => Parties.order(b.key) - Parties.order(a.key))}
                    />
                </div>

                <div className="col-md-6">
                    {this.renderPartyText()}
                </div>
            </div>
        );
    }

    renderPeopleStats() {
        let people = this.state.people[this.props.unit] || [];

        if (people.length) {
            let topPerson = people[0];
            let num = this.props.unit === 'pct' ? `${topPerson.pct.toFixed(2)} %` : topPerson.count;
            let unitText = this.props.unit === 'pct' ? 'av sine innlegg' : 'innlegg';

            return (
                <div className="row stats">
                    <div className="col-md-5 text-center">
                        <img
                            src={ImageUtils.personImageFor(topPerson.meta.external_id)}
                            alt={`Bilde av ${topPerson.key}`}
                            height="200"
                        />

                        <h2 className={`hdo-party-${topPerson.meta.party.toLowerCase()}`}>
                            {topPerson.key} ({topPerson.meta.party})
                        </h2>


                        <div className="lead">
                            <div>
                                har nevnt <strong>{this.state.query}</strong> i
                            </div>

                            <span style={{fontSize: '4rem', padding: '10px'}}>
                                {num}
                            </span>

                            {unitText}
                        </div>

                    </div>

                    <div className="col-md-7">
                        <TopListChart
                            subtitle="Topp 10 personer"
                            unit={this.props.unit}
                            orientation={this.props.orientation}
                            counts={people}
                            sort={true}
                        />
                    </div>
                </div>
            );
        } else {
            return <div />;
        }
    }


    renderPartyText() {
        let topParty  = this.state.topParties[this.props.unit];
        let num       = this.props.unit === 'pct' ? topParty.pct.toFixed(2) + ' %' : topParty.count;
        let unitText  = this.props.unit === 'pct' ? 'av sine innlegg' : 'innlegg';

        return (
            <div className="text-center" style={{padding: '10rem 0'}}>
                <h2 className={`hdo-party-${topParty.key.toLowerCase()}`}>
                    {Parties.names[topParty.key]}
                </h2>

                <div className="lead">
                    <div>
                        har nevnt <strong>{this.state.query}</strong> i
                    </div>

                    <span style={{fontSize: '3.5rem', padding: '10px'}}>
                        {num}
                    </span>

                    {unitText}
                </div>
            </div>
        );
    }

    topParties(parties) {
        return {
            pct: parties.slice(0).sort((a, b) => b.pct - a.pct)[0],
            count: parties.slice(0).sort((a, b) => b.count - a.count)[0]
        };
    }
}

ResultStats.propTypes = {
};

module.exports = ResultStats;