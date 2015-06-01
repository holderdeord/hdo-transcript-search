import React        from 'react';
import TopListChart from './TopListChart';
import Parties      from '../../shared/Parties';
import ImageUtils   from '../utils/ImageUtils';
import Colors       from '../utils/Colors';

class ResultStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            parties: [],
            people: {},
            query: ''
        };

        this.bigNumberStyle = {
            fontSize: '4rem',
            padding: '10px',
            verticalAlign: '-0.55rem'
        };
    }

    componentWillReceiveProps(props) {
        let parties = [];
        let people  = {};
        let query   = '';

        let focusedIndex = this.props.focusedIndex || 0;
        let result = props.results[focusedIndex];

        if (result) {
            query   = result.query;
            people  = result.result.people;
            parties = result.result.parties;
        }

        this.setState({
            query: query,
            parties: parties,
            people: people,
            topParties: this.topParties(parties),
            labelClassName: Colors.colorAt(focusedIndex)
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
        this.state.parties.sort((a, b) => a[this.props.unit] - b[this.props.unit]);
        let topParty = this.state.topParties[this.props.unit];

        if (topParty) {
            let topPartyName = Parties.names[topParty.key];
            let num          = this.props.unit === 'pct' ? topParty.pct.toFixed(2) + '%' : topParty.count;
            let unitText     = this.props.unit === 'pct' ? 'av sine innlegg' : 'innlegg';

            return (
                <div className="row result-box">
                    <div className="col-md-5">
                        <div className="text-center">
                            <div>
                                <img
                                    src={ImageUtils.partyLogoFor(topParty.key)}
                                    alt={`${topPartyName}s logo`}
                                    height="200"
                                />

                                <h2>
                                    {topPartyName}
                                </h2>
                            </div>

                            <div className="lead">
                                <div>
                                    har nevnt <strong>{this.state.query}</strong> i
                                </div>

                                <span style={this.bigNumberStyle}>
                                    {num}
                                </span>

                                {unitText}
                            </div>
                        </div>
                    </div>

                    <div className={"col-md-7"}>
                        <TopListChart
                            className={this.state.labelClassName}
                            subtitle="Partier"
                            orientation={this.props.orientation}
                            unit={this.props.unit}
                            counts={this.state.parties}
                        />
                    </div>
                </div>
            );
        }
    }

    renderPeopleStats() {
        let people = (this.state.people[this.props.unit] || []).slice(0, 8);

        if (people.length) {
            let topPerson      = people[0];
            let num            = this.props.unit === 'pct' ? `${topPerson.pct.toFixed(2)}%` : topPerson.count;
            let unitText       = this.props.unit === 'pct' ? 'av sine innlegg' : 'innlegg';
            let partyClassName = topPerson.meta.party ? `hdo-party-${topPerson.meta.party.toLowerCase()}` : '';
            let partyText      = topPerson.meta.party ? `(${topPerson.meta.party})` : '';

            return (
                <div className="row result-box">
                    <div className="col-md-5 text-center">
                        <img
                            src={ImageUtils.personImageFor(topPerson.meta.external_id)}
                            alt={`Bilde av ${topPerson.key}`}
                            height="200"
                        />

                        <h2>
                            {topPerson.key} {partyText}
                        </h2>


                        <div className="lead">
                            <div>
                                har nevnt <strong>{this.state.query}</strong> i
                            </div>

                            <span style={this.bigNumberStyle}>
                                {num}
                            </span>

                            {unitText}
                        </div>

                    </div>

                    <div className="col-md-7">
                        <TopListChart
                            className={this.state.labelClassName}
                            subtitle={`Personer`}
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