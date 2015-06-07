import React      from 'react';
import TimeUtils  from '../utils/TimeUtils';
import ImageUtils from '../utils/ImageUtils';
import Analytics  from '../stores/Analytics';
import {Link}     from 'react-router';
import Icon       from 'react-fa';

class SearchHit extends React.Component {
    constructor() {
        this.state = {useFallbackImage: false};
    }

    render() {
        let hit       = this.props.hit;
        let person    = hit.name;
        let timestamp = TimeUtils.timestampForHit(hit);
        let title     = hit.title;

        let linkParams = {
            transcript: hit.transcript,
            order: hit.order
        };

        if (hit.party) {
            title = `${title}, ${hit.party}`;
        }

        return (
            <div className="row hit">
                <div className="col-md-3">
                    <div className="row">
                        <div className="col-md-1">
                            <Icon name="calendar" />
                        </div>

                        <div className="col-md-8">
                            <Link to="speech" params={linkParams}>
                                <span className="text-muted">{timestamp}</span>
                            </Link>
                        </div>
                    </div>

                    <div className="row" style={{paddingTop: '0.8rem'}}>
                        <div className="col-md-1">
                            <Icon name="user" />
                        </div>

                        <div className="col-md-8">
                            <strong>{person}</strong>
                        </div>
                    </div>


                    <div className="row">
                        <div className="col-md-1">
                        </div>

                        <div className="col-md-8">
                            {title}
                        </div>
                    </div>
                </div>

                <div className="col-md-2">
                    {this.imageFor(hit)}
                </div>

                <div className="col-md-7">
                    <div className="speech-text">{this.paragraphsFrom(hit.highlight.text[0])}</div>
                </div>

                <small className="pull-right" style={{paddingTop: '1rem'}}>
                    <Link to="speech" params={linkParams}>
                        Se innlegget i kontekst <Icon name="arrow-right" />
                    </Link>
                </small>
            </div>
        );
    }

    imageFor(hit) {
        let height = 180;
        let src = this.state.useFallbackImage ?
            ImageUtils.fallbackImage() : ImageUtils.personImageFor(hit.external_id);

        return (
            <img
                src={src}
                alt={hit.name}
                height={height}
                onError={this.handleImageError.bind(this)} />
        );

    }

    handleOpenContext() {
        window.alert('not implemented');
    }

    handleImageError() {
        if (!this.state.useFallbackImage) {
            Analytics.sendEvent('image-error', this.props.hit.external_id);
            this.setState({useFallbackImage: true});
        }
    }

    paragraphsFrom(text) {
        return text.split("\n").map((fragment, i) => {
            fragment = fragment.replace(/<\/mark>(\s*)<mark>/g, '$1');

            return (<p key={i} dangerouslySetInnerHTML={{__html: fragment}}></p>);
        });
    }
}

SearchHit.propTypes = {
    hit: React.PropTypes.object.isRequired
};

module.exports = SearchHit;
