import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import TopListChart from './TopListChart';
import Parties from '../../shared/Parties';
import ImageUtils from '../utils/ImageUtils';
import Colors from '../utils/Colors';
import ImageWithFallback from './ImageWithFallback';

const MIN_SPEECH_COUNT = require('../../shared/minSpeechCount');

@connect(({ summary: { results } }) => ({ results }))
export default class ResultStats extends Component {
    static propTypes = {
        unit: PropTypes.string.isRequired,
        orientation: PropTypes.string.isRequired,
    };

    state = {
        parties: [],
        people: {},
        query: '',
    };

    bigNumberStyle = {
        fontSize: '4rem',
        padding: '10px',
        verticalAlign: '-0.55rem',
    };

    componentWillReceiveProps(props) {
        let results = props.results || [];
        let parties = [];
        let people = {};
        let query = '';

        let focusedIndex = props.focusedIndex || 0;
        let result = results[focusedIndex];

        if (result) {
            query = result.query;
            people = result.result.people;
            parties = result.result.parties;
        }

        this.setState({
            query: query,
            parties: parties,
            people: people,
            topParties: this.topParties(parties),
            labelClassName: Colors.colorAt(focusedIndex),
        });
    }

    render() {
        if (this.state.query.length) {
            return (
                <div className="card">
                    <div className="row result-box result-box-header">
                        <div className="col-md-12">
                            <h4 className="text-center">
                                Hvem nevner «{this.state.query}» oftest?
                            </h4>
                        </div>
                    </div>

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

        if (!topParty) {
            return null;
        }

        let topPartyName = Parties.names[topParty.key];
        let num =
            this.props.unit === 'pct'
                ? `${topParty.pct.toFixed(2).replace('.', ',')}%`
                : topParty.count;
        let unitText = this.props.unit === 'pct' ? 'av sine innlegg' : 'innlegg';

        return (
            <div className="row result-box">
                <div className="col-md-5">
                    <div className="text-center">
                        <div>
                            <img
                                src={ImageUtils.partyLogoFor(topParty.key)}
                                alt={`${topPartyName}s logo`}
                                className="party-logo"
                            />

                            <h2 className="selectable">{topPartyName}</h2>
                        </div>

                        <div className="lead selectable">
                            <div>
                                har nevnt <strong>{this.state.query}</strong> i
                            </div>

                            <span style={this.bigNumberStyle}>{num}</span>

                            {unitText}
                        </div>
                    </div>
                </div>

                <div className={'col-md-7'}>
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

    renderPeopleStats() {
        let people = this.state.people[this.props.unit] || [];
        let isPct = this.props.unit === 'pct';

        people = people.slice(0, 8);

        if (people.length) {
            let topPerson = people[0];
            let num = isPct
                ? `${topPerson.pct.toFixed(2).replace('.', ',')}%`
                : topPerson.count;
            let unitText = isPct ? 'av sine innlegg' : 'innlegg';
            // let partyClassName = topPerson.meta.party ? `hdo-party-${topPerson.meta.party.toLowerCase()}` : '';
            let partyText = topPerson.meta.party ? `(${topPerson.meta.party})` : '';

            return (
                <div>
                    <div className="row result-box">
                        <div className="col-md-5">
                            <div className="text-center">
                                <ImageWithFallback
                                    src={ImageUtils.personImageFor(
                                        topPerson.meta.external_id
                                    )}
                                    alt={`Bilde av ${topPerson.key}`}
                                    height={200}
                                    fallbackSrc={ImageUtils.fallbackImage()}
                                />

                                <h2 className="selectable">
                                    {topPerson.key} {partyText}
                                </h2>

                                <div className="lead selectable">
                                    <div>
                                        har nevnt <strong>{this.state.query}</strong>{' '}
                                        i
                                    </div>

                                    <span style={this.bigNumberStyle}>{num}</span>

                                    {unitText}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-7">
                            <TopListChart
                                className={this.state.labelClassName}
                                subtitle="Personer"
                                star={isPct}
                                unit={this.props.unit}
                                orientation={this.props.orientation}
                                counts={people}
                                sort={true}
                            />
                        </div>
                    </div>

                    {isPct ? this.renderDisclaimer() : null}
                </div>
            );
        } else {
            return <div />;
        }
    }

    renderDisclaimer() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <div
                            className="text-muted text-center pull-right"
                            style={{ padding: '1rem 2rem' }}>
                            <small>
                                * Ekskludert personer med færre enn{' '}
                                {MIN_SPEECH_COUNT} innlegg totalt.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    topParties(parties) {
        return {
            pct: parties.slice(0).sort((a, b) => b.pct - a.pct)[0],
            count: parties.slice(0).sort((a, b) => b.count - a.count)[0],
        };
    }
}
