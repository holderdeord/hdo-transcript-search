import React from 'react';
import moment from 'moment';

var {div,h3,ol,li,small,a} = React.DOM;
moment.locale('nb');

class TopHits extends React.Component {

    render() {
        var result       = this.props.result;
        var hitCountText = `${result.hitCount} av ${result.totalCount} innlegg`;

        if (this.props.query.length) {
            hitCountText = `Fant '${this.props.query}' i ${hitCountText}`;
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

TopHits.propTypes = {
    query: React.PropTypes.string,
    result: React.PropTypes.shape({
        hitCount: React.PropTypes.number.isRequired,
        totalCount: React.PropTypes.number.isRequired,
        hits: React.PropTypes.array.isRequired
    }).isRequired
};

module.exports = TopHits;
