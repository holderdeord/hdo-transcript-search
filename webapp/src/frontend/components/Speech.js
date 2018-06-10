import React, { PropTypes, Component } from 'react';
import TimeUtils from '../utils/TimeUtils';
import ImageUtils from '../utils/ImageUtils';
import { Link } from 'react-router';
import ImageWithFallback from './ImageWithFallback';

export default class Speech extends Component {
    static propTypes = {
        speech: PropTypes.object.isRequired,
        showTime: PropTypes.bool,
        showContextLink: PropTypes.bool,
    };

    state = { useFallbackImage: false };

    render() {
        let speech = this.props.speech;
        let timestamp = TimeUtils.timestampForHit(speech);
        let title = speech.title;

        if (speech.party) {
            title = `${title}, ${speech.party}`;
        }

        if (this.props.showTime) {
            timestamp = `${timestamp} ${TimeUtils.formatHitTime(speech)}`;
        }

        if (speech.name === 'Presidenten' && speech.presidents.length === 1) {
            var president = speech.presidents[0];

            speech.name = president.name;
            speech.external_id = president.external_id; // eslint-disable-line
        }

        return (
            <div>
                <div className="row speech">
                    <div className="col-xs-6 col-md-3">
                        <div className="row">
                            <div className="col-xs-1">
                                <i className="fa fa-calendar" />
                            </div>

                            <div className="col-xs-8">
                                <Link
                                    to={`/speeches/${speech.transcript}/${
                                        speech.order
                                    }`}>
                                    <span className="text-muted">{timestamp}</span>
                                </Link>
                            </div>
                        </div>

                        <div className="row" style={{ paddingTop: '0.8rem' }}>
                            <div className="col-xs-1">
                                <i className="fa fa-user" />
                            </div>

                            <div className="col-xs-8">
                                <strong>{speech.name}</strong>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-xs-1" />

                            <div className="col-xs-8">{title}</div>
                        </div>

                        <div
                            className="row context-links"
                            style={{ paddingTop: '0.8rem', fontSize: '80%' }}>
                            <div className="col-xs-1">
                                <i className="fa fa-external-link fa-lg" />
                            </div>

                            <div className="col-xs-8">
                                <a
                                    href={`https://stortinget.no/no/Saker-og-publikasjoner/Publikasjoner/Referater/Stortinget/${
                                        speech.session
                                    }/${speech.transcript}/`}>
                                    Referat hos Stortinget
                                </a>
                            </div>
                        </div>

                        {this.props.showContextLink !== false && (
                            <div
                                className="row context-links"
                                style={{ paddingTop: '0.8rem', fontSize: '80%' }}>
                                <div className="col-xs-1">
                                    <i className="fa fa-comments fa-lg" />
                                </div>

                                <div className="col-xs-8">
                                    <Link
                                        to={`/speeches/${speech.transcript}/${
                                            speech.order
                                        }`}>
                                        Innlegget i kontekst
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-xs-6 col-md-2">
                        <ImageWithFallback
                            className="img-responsive"
                            src={ImageUtils.personImageFor(speech.external_id)}
                            alt={speech.name}
                            height={180}
                            fallbackSrc={ImageUtils.fallbackImage()}
                        />
                    </div>

                    <div className="col-xs-12 col-md-7">
                        <div className="speech-text">
                            {this.paragraphsFrom(speech)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    paragraphsFrom(speech) {
        let text = speech.highlight ? speech.highlight.text.join('\n') : speech.text;

        return text.split('\n').map((fragment, i) => {
            fragment = fragment.replace(/<\/mark>(\s*)<mark>/g, '$1');

            return <p key={i} dangerouslySetInnerHTML={{ __html: fragment }} />;
        });
    }
}
