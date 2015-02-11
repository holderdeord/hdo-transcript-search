import React from 'react';
import moment from 'moment';
import TranscriptStore from '../stores/TranscriptStore';

var {div,h3,ol,li,span,a} = React.DOM;
moment.locale('nb');

class TopHits extends React.Component {

    constructor(props) {
        super(props);
        this.state = TranscriptStore.getResult();
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.onChange.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.onChange.bind(this));
    }

    onChange() {
        this.setState(TranscriptStore.getResult());
    }

    render() {
        var elements     = this.state.hits.map(this.renderHit);
        var hitCountText = `${this.state.hitCount} av ${this.state.totalCount} innlegg`;

        return div(null,
                   span({className: 'text-muted'}, hitCountText),
                   h3(null, 'Treff'),
                   ol(null, elements)
                  );
    }

    renderHit(hit) {
        var source    = hit._source;
        var timestamp = moment(source.time).format('LLL');
        var person    = source.name;
        var roles     = [source.title, source.party].filter(s => s && s !== 'President' && s !== 'Representant');

        if (roles.length) {
            person = `${person} (${roles.join(', ')})`;
        }

        var href      = `/api/speeches/${hit._id}`; // FIXME: don't hardcode paths

        return li({key: hit._id, className: 'hit'},
                  div({className: 'pull-right'},
                      a({href: href, style: {color: 'inherit'}}, timestamp)),
                  div(null, person),
                  div({className: 'text-muted', dangerouslySetInnerHTML: {__html: hit.highlight.text}})
                 );
    }
}

module.exports = TopHits;
