import React from 'react';
var SearchHit = React.createFactory(require('./SearchHit'));

var {div,h3,small} = React.DOM;


class TopHits extends React.Component {

    render() {
        var result       = this.props.result;
        var hitCountText = `${result.hitCount} av ${result.totalCount} innlegg`;
        var style        = {display: 'none'};

        if (this.props.query.length) {
            hitCountText = `Fant '${this.props.query}' i ${hitCountText}`;
            style.display = 'block';
        }

        return div(
            {className: 'col-md-8', style: style},
            h3(null, 'Treff'),
            small(null, hitCountText),
            result.hits.map(h => SearchHit({hit: h, key: h._id}))
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
