import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import BaseChart from './BaseChart';
import TimeUtils from '../utils/TimeUtils';
import Intervals from '../constants/Intervals';
import minSpeechCount from '../../shared/minSpeechCount';
import Parties from '../../shared/Parties';

const LANGS = {
    nn: 'Nynorsk',
    nb: 'Bokmål'
};

@connect(({ stats: { lix } }) => ({ stats: lix }))
export default class Lix extends Component {
    static propTypes = {
        stats: PropTypes.object.isRequired
    };

    state = {
        adjustYAxis: true
    };

    renderTimeline(timeline) {
        const data = {
            labels: timeline.buckets.map(d =>
                TimeUtils.formatIntervalLabel(d.key, Intervals.YEAR)
            ),
            series: [{ data: timeline.buckets.map(e => e.scoreStats.avg) }]
        };

        return (
            <BaseChart
                type="Line"
                options={{ low: this.state.adjustYAxis ? undefined : 0 }} // eslint-disable-line
                data={data}
            />
        );
    }

    render() {
        const {
            scoreStats,
            parties,
            timeline,
            topRepresentatives,
            bottomRepresentatives,
            languages
        } = this.props.stats;
        const cardStyle = { margin: '1rem', padding: '1rem' };

        return (
            <div className="container">
                <div style={cardStyle}>
                    <h1>LIX</h1>

                    <div className="checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={this.state.adjustYAxis}
                                onChange={() =>
                                    this.setState({
                                        adjustYAxis: !this.state.adjustYAxis
                                    })}
                            />
                            Tilpass Y-akser
                        </label>
                    </div>
                </div>

                <div className="card" style={cardStyle}>
                    <div className="row">
                        <div className="col-md-4">
                            <h2>Alle innlegg</h2>
                            {scoreStats ? this.renderStat(scoreStats) : null}
                        </div>

                        <div className="col-md-8">
                            {timeline ? this.renderTimeline(timeline) : null}
                        </div>
                    </div>
                </div>

                <div className="card" style={cardStyle}>
                    <div className="row">
                        <div className="col-md-12">
                            <div>
                                <h2>Partier</h2>
                            </div>
                        </div>
                    </div>

                    {parties.buckets.map(
                        ({ key, scoreStats: ss, timeline: tl }) => (
                            <div className="row" key={key}>
                                <div className="col-md-4">
                                    <h3>{Parties.nameFor(key)}</h3>
                                    {ss ? this.renderStat(ss) : null}
                                </div>

                                <div className="col-md-8">
                                    {tl ? this.renderTimeline(tl) : null}
                                </div>
                            </div>
                        )
                    )}
                </div>

                <div className="card" style={cardStyle}>
                    <div className="row">
                        <div className="col-md-12">
                            <div>
                                <h2>Representanter</h2>

                                <p>
                                    Representanter med færre enn{' '}
                                    {minSpeechCount} innlegg er ekskludert.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <h5>Topp 20, snitt LIX-score og antall innlegg</h5>

                            <ol>
                                {(topRepresentatives
                                    ? topRepresentatives.buckets
                                    : []).map(tr => (
                                    <li key={tr.key}>
                                        <strong>
                                            {tr.key} ({tr.person.hits.hits[0]._source.party}):
                                        </strong>{' '}
                                        {tr.avgLixScore.value.toFixed()} ({this.getDescription(tr.avgLixScore.value)}),{' '}
                                        {tr.doc_count} innlegg
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="col-md-6">
                            <h5>Bunn 20, snitt LIX-score og antall innlegg</h5>

                            <ol>
                                {(bottomRepresentatives
                                    ? bottomRepresentatives.buckets
                                    : []).map(tr => (
                                    <li key={tr.key}>
                                        <strong>
                                            {tr.key} ({tr.person.hits.hits[0]._source.party}):
                                        </strong>{' '}
                                        {tr.avgLixScore.value.toFixed()} ({this.getDescription(tr.avgLixScore.value)}),{' '}
                                        {tr.doc_count} innlegg
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>

                <div className="card" style={cardStyle}>
                    <h2>Målform</h2>

                    <div className="row">
                        {languages.buckets.map(b => (
                            <div className="col-md-6" key={b.key}>
                                <h3>{LANGS[b.key]}</h3>

                                {this.renderStat(b.scoreStats)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    renderStat(stat) {
        return (
            <div>
                <p>
                    Snitt LIX-score: <strong>{stat.avg.toFixed()}</strong> ({this.getDescription(stat.avg)})
                </p>
                <p>Antall innlegg: {stat.count}</p>
            </div>
        );
    }

    getDescription(lixScore) {
        lixScore = +lixScore.toFixed();

        if (lixScore < 30) {
            return 'Veldig lettlest / barnebøker';
        } else if (lixScore < 40) {
            return 'Lettlest, skjønnlitteratur';
        } else if (lixScore < 50) {
            return 'Middels vanskelig, avistekst';
        } else if (lixScore < 60) {
            return 'Vanskelig, offisielle tekster';
        } else if (lixScore > 60) {
            return 'Meget vanskelig, byråkratnorsk';
        } else {
            return 'Ukjent';
        }
    }
}
