import React               from 'react';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes         from '../constants/ActionTypes';
import TimeUtils           from '../utils/TimeUtils';
import ImageUtils          from '../utils/ImageUtils';

class SearchHit extends React.Component {

    render() {
        return (
            <div className="row hit">
                {this.renderMetaData()}
                {this.renderHighlight()}
                {this.renderControls()}
            </div>
        );
    }

    shouldShowTitle(source) {
        return source.title && source.title !== 'President' && source.title !== 'Representant';
    }

    renderMetaData() {
        let hit       = this.props.hit;
        let href      = `/api/speeches/${hit.id}`; // FIXME: don't hardcode paths
        let person    = hit.name;
        let timestamp = TimeUtils.timestampForHit(hit);
        let title     = this.shouldShowTitle(hit) ? hit.title : '';

        if (hit.party) {
            person = `${person} (${hit.party})`;
        }

        return (
            <div className="col-sm-3 text-right">
                <a className="text-muted" href={href}>{timestamp}</a>
                <div><strong>{person}</strong></div>
                <div>{title}</div>
                {this.imageFor(hit)}
            </div>
        );
    }

    renderHighlight() {
        return (
            <div
                className="col-sm-5"
                dangerouslySetInnerHTML={{__html: this.props.hit.highlight}}
            />
        );
    }

    renderControls() {
        return (
            <div className="col-sm-2 text-right">
                <button
                    className="btn btn-default btn-sm"
                    onClick={this.showContext.bind(this)}>
                    Se kontekst
                </button>
            </div>
        );

    }

    imageFor(hit) {
        if (hit.external_id) {
            let src = ImageUtils.personImageFor(hit.external_id);
            return <img src={src} alt={hit.name} />;
        } else {
            return '';
        }

    }

    showContext() {
        var hit = this.props.hit;

        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.SPEECH_CONTEXT,
            transcript: hit.transcript,
            start: hit.order - 1,
            end: hit.order + 1
        });
    }
}

SearchHit.propTypes = {
    hit: React.PropTypes.object.isRequired
};

module.exports = SearchHit;
