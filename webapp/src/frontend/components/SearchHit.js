import React from 'react';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import moment from 'moment';

moment.locale('nb');

var {div,a,button} = React.DOM;

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
        var source    = this.props.hit._source;
        var href      = `/api/speeches/${this.props.hit._id}`; // FIXME: don't hardcode paths
        var person    = source.name;
        var timestamp = moment(source.time).format('LLL');
        var title     = this.shouldShowTitle(source) ? source.title : '';

        if (source.party) {
            person = `${person} (${source.party})`;
        }

        return div(
            {className: 'col-md-4'},
            div(null, person),
            div(null, title),
            a({className: 'text-muted', href: href}, timestamp)
        );
    }

    renderHighlight() {
        var highlight = this.props.hit.highlight ? this.props.hit.highlight.text : '';

        return div({
            className: 'col-md-5',
            dangerouslySetInnerHTML: {__html: highlight}
        });
    }

    renderControls() {
        return div(
            {className: 'col-md-3'},
            button({className: 'btn btn-sm', onClick: this.showContext.bind(this)}, 'Se kontekst')
        );
    }

    showContext() {
        var source = this.props.hit._source;

        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.SPEECH_CONTEXT,
            transcript: source.transcript,
            start: source.order - 2,
            end: source.order + 2
        });
    }
}

SearchHit.propTypes = {
    hit: React.PropTypes.object.isRequired
};

module.exports = SearchHit;
