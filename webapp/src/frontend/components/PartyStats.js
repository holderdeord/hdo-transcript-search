import React           from 'react';
import TopListChart    from './TopListChart';
import Parties         from '../constants/Parties';

class PartyStats extends React.Component {
    constructor(props) {
        super(props);
        this.state = { parties: [] };
        this.searchStore = this.props.flux.getStore('search');
    }

    componentDidMount() {
        this.searchStore.addListener('change', this.handleChange.bind(this));
    }

    componentWillUnmount() {
        this.searchStore.removeListener('change', this.handleChange.bind(this));
    }

    handleChange() {
        let parties = [];
        let query   = '';

        let result = this.searchStore.getLastResult();

        if (result) {
            parties = result.result.parties;
            query = result.query;
        }

        this.setState({
            query: query,
            parties: parties,
            topParties: this.topParties(parties)
        });
    }

    render() {
        if (this.state.parties.length) {
            return (
                <div className="row stats card">
                    <div className="col-md-6">
                        {this.renderChart()}
                    </div>

                    <div className="col-md-6">
                        {this.renderText()}
                    </div>
                </div>
            );
        } else {
            return <div />;
        }
    }

    renderText() {
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

    renderChart() {
        return (
            <TopListChart
                subtitle="Partier"
                orientation={this.props.orientation}
                unit={this.props.unit}
                counts={this.state.parties.sort((a, b) => Parties.order(b.key) - Parties.order(a.key))}
            />
        );
    }

    topParties(parties) {
        return {
            pct: parties.slice(0).sort((a, b) => b.pct - a.pct)[0],
            count: parties.slice(0).sort((a, b) => b.count - a.count)[0]
        };
    }
}

PartyStats.propTypes = {
};

module.exports = PartyStats;