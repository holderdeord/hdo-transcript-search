import React      from 'react';
import TimeUtils  from '../utils/TimeUtils';
import ImageUtils from '../utils/ImageUtils';
import Analytics  from '../stores/Analytics';

class SearchHit extends React.Component {
    constructor() {
        this.state = {useFallbackImage: false};
    }

    render() {
        let hit       = this.props.hit;
        let href      = `/api/speeches/${hit.id}`; // FIXME: don't hardcode paths
        let person    = hit.name;
        let timestamp = TimeUtils.timestampForHit(hit);
        let title     = hit.title;

        if (hit.party) {
            title = `${title}, ${hit.party}`;
        }

        return (
            <div className="row hit">
                <div className="col-sm-2">
                    <a className="text-muted" href={href}>{timestamp}</a>
                </div>

                <div className="col-sm-3">
                    <div><strong>{person}</strong></div>
                    <div>{title}</div>
                    {this.imageFor(hit)}
                </div>

                <div
                  className="col-sm-7"
                  xxdangerouslySetInnerHTML={{__html: this.props.hit.highlight}}>
                    <blockquote>{this.props.hit.text}</blockquote>

                    <small className="pull-right">
                        <a onClick={this.handleOpenContext.bind(this)}>
                            Se innlegget i kontekst
                        </a>
                    </small>
                </div>
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
}

SearchHit.propTypes = {
    hit: React.PropTypes.object.isRequired
};

module.exports = SearchHit;
