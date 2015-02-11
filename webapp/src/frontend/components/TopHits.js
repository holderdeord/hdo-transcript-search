import React from 'react';
import moment from 'moment';
import TranscriptStore from '../stores/TranscriptStore';

var {div,h3,ol,li,small,a} = React.DOM;
moment.locale('nb');

class TopHits extends React.Component {

    constructor(props) {
        super(props);
        this.state = {result: TranscriptStore.getResult(), query: TranscriptStore.getQuery()};
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.onChange.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.onChange.bind(this));
    }

    onChange() {
        this.setState({result: TranscriptStore.getResult(), query: TranscriptStore.getQuery()});
    }

    render() {
        var result       = this.state.result;
        var hitCountText = `${result.hitCount} av ${result.totalCount} innlegg`;

        if (this.state.query.length) {
            hitCountText = `Fant '${this.state.query}' i ${hitCountText}`;
        }

        return div(null,
                   h3(null, 'Treff',
                      small({className: 'pull-right text-muted'}, hitCountText)),
                   ol(null, result.hits.map(this.renderHit))
                  );
    }

    renderHit(hit) {
        var href      = `/api/speeches/${hit._id}`; // FIXME: don't hardcode paths
        var source    = hit._source;
        var timestamp = moment(source.time).format('LLL');
        var person    = source.name;
        var roles     = [source.title, source.party].filter(s => s && s !== 'President' && s !== 'Representant');

        if (roles.length) {
            person = `${person} (${roles.join(', ')})`;
        }

        return li({key: hit._id, className: 'hit'},
                  div({className: 'pull-right'},
                      a({href: href, style: {color: 'inherit'}}, timestamp)),
                  div(null, person),
                  div({className: 'text-muted', dangerouslySetInnerHTML: {__html: hit.highlight.text}})
                 );
    }
}

module.exports = TopHits;
