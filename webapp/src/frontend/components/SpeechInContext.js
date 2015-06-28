import React             from 'react';
import FluxComponent     from 'flummox/component';
import { Link }          from 'react-router';
import Icon              from 'react-fa';
import TimeUtils         from '../utils/TimeUtils';
import ImageUtils        from '../utils/ImageUtils';
import ImageWithFallback from './ImageWithFallback';
import TextUtils         from '../utils/TextUtils';

class SpeechBrowser extends React.Component {
    render() {
        let speeches = this.props.speeches;

        if (!speeches) {
            return null;
        }

        let [first,focused,last] = speeches;
        focused.focused = true;

        let prevLink = null, nextLink = null;

        if (first && first.order > 0) {
            prevLink = (
                <Link to="speech" params={{transcript: first.transcript, order: first.order}}>
                    <Icon name="chevron-left"/>

                    <strong>Forrige innlegg:</strong>

                    <span>
                        {first.name} {first.party ? `(${first.party})` : ''}
                    </span>
                </Link>
            );
        }

        if (last) {
            nextLink = (
                <Link to="speech" params={{transcript: last.transcript, order: last.order}}>
                    <strong>Neste innlegg:</strong>

                    <span>
                        {last.name} {last.party ? `(${last.party})` : ''}
                    </span>

                    <Icon name="chevron-right"/>
                </Link>
            );
        }

        // return (
        //     <div className="container">
        //         <div className="row navigation-links">
        //             <div className="col-xs-6 col-md-6">{prevLink}</div>
        //             <div className="col-xs-6 col-md-6 text-right">{nextLink}</div>
        //         </div>

        //         <div className="row card" style={{margin: '1rem 0'}}>
        //             <div className="col-md-12">
        //                 <Speech key={focused.id} speech={focused} showContextLink={false} showTime={true} />
        //             </div>
        //         </div>

        //         <div className="row navigation-links">
        //             <div className="col-xs-6 col-md-6">{prevLink}</div>
        //             <div className="col-xs-6 col-md-6 text-right">{nextLink}</div>
        //         </div>
        //     </div>
        // );

        return (
            <div className="container speech-browser">
                <div className="col-md-4 context">
                    {speeches.map(this.renderPreview.bind(this))}
                </div>

                <div className="col-md-8 main">
                    <div className="row">
                        <div className="col-md-12 text">
                            {TextUtils.paragraphsFrom(focused)}
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    renderPreview(speech) {
        return (
            <Link key={speech.id} to="speech" params={{transcript: speech.transcript, order: speech.order}}>
                <div className={`preview-row ${speech.focused ? 'focused' : ''}`}>
                    <div className="row">
                        <div className="col-md-3">
                            {this.renderImage(speech)}
                        </div>

                        <div className="col-md-9">
                            <div className="row">
                                <div className="col-md-9"><strong>{speech.name}</strong></div>
                                <div className="col-md-3 text-right">{TimeUtils.formatHitTime(speech)}</div>
                            </div>

                            <div className="row text">
                                <div className="col-md-12">
                                    – {TextUtils.teaser(speech).slice(0, 100) + '…'}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </Link>
        );
    }

    renderImage(speech) {
        return (
            <ImageWithFallback
                className="img-responsive"
                src={ImageUtils.personImageFor(speech.external_id)}
                alt={speech.name}
                fallbackSrc={ImageUtils.fallbackImage()} />
        );
    }
}

class SpeechInContext extends React.Component {
    render() {
        return (
            <FluxComponent connectToStores={['speech']}>
                <SpeechBrowser />
            </FluxComponent>
        );
    }
}

module.exports = SpeechInContext;