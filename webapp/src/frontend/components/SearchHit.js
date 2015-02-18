import React from 'react';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import moment from 'moment';

moment.locale('nb');

var {div,a,button,strong} = React.DOM;

class SearchHit extends React.Component {

    render() {
        return div(
            {className: 'row hit'},
            this.renderMetaData(),
            this.renderHighlight(),
            this.renderControls()
        );
    }

    shouldShowTitle(source) {
        return source.title && source.title !== 'President' && source.title !== 'Representant';
    }

    renderMetaData() {
        var hit       = this.props.hit;
        var href      = `/api/speeches/${hit.id}`; // FIXME: don't hardcode paths
        var person    = hit.name;
        var timestamp = moment(hit.time).format('LLL');
        var title     = this.shouldShowTitle(hit) ? hit.title : '';

        if (hit.party) {
            person = `${person} (${hit.party})`;
        }

        return div(
            {className: 'col-sm-3 text-right'},
            div({},
                strong({}, person)
            ),
            div(null, title),
            a({className: 'text-muted', href: href}, timestamp)
        );
    }

    renderHighlight() {
        return div({
            className: 'col-sm-5',
            dangerouslySetInnerHTML: {__html: this.props.hit.highlight}
        });
    }

    renderControls() {
        return div(
            {className: 'col-sm-2 text-right'},
            button({className: 'btn btn-default btn-sm', onClick: this.showContext.bind(this)}, 'Se kontekst')
        );
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
