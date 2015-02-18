import React from 'react';
var SearchHit = React.createFactory(require('./SearchHit'));

var {div,h3,em} = React.DOM;


class TopHits extends React.Component {

    render() {
        let result       = this.props.result;
        let q            = this.props.query;
        let pct          = result.counts.pct.toFixed(2);
        let hits         = result.counts.hits;
        let total        = result.counts.total;
        let hitCountText = `Fant «${q}» i ${pct}% (${hits} / ${total}) av innlegg.`;

        return div(
            {className: 'col-md-12'},
            h3(null, 'Treff'),
            em(null, hitCountText),
            result.hits.map(h => SearchHit({hit: h, key: h.id}))
        );
    }
}

TopHits.propTypes = {
    query: React.PropTypes.string,
    result: React.PropTypes.shape({
        counts: React.PropTypes.object.isRequired,
        hits: React.PropTypes.array.isRequired
    }).isRequired
};

module.exports = TopHits;
