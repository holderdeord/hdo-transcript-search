import React      from 'react';
import TimeUtils  from '../utils/TimeUtils';
import ImageUtils from '../utils/ImageUtils';

class SearchHit extends React.Component {

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
                        <a href="#">Se kontekst</a>
                    </small>
                </div>
             </div>
        );
    }

    imageFor(hit) {
        let height = 180;

        if (hit.external_id) {
            let src = ImageUtils.personImageFor(hit.external_id);
            return <img src={src} alt={hit.name} height={height} />;
        } else {
            return <div style={{minHeight: height}} />;
        }

    }
}

SearchHit.propTypes = {
    hit: React.PropTypes.object.isRequired
};

module.exports = SearchHit;
