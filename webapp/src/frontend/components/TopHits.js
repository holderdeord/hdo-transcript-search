import React from 'react';
import SearchHit from './SearchHit';

class TopHits extends React.Component {

    render() {
        let result = this.props.result;
        let q      = this.props.query;
        let pct    = result.counts.pct.toFixed(2);
        let hits   = result.counts.hits;
        let total  = result.counts.total;

        return (
            <div className="col-md-12">
                <h3>Treff</h3>
                <em>
                    Fant «{q}» i {pct}% ({hits} / {total}) av innlegg.
                </em>
                {result.hits.map(h => <SearchHit hit={h} key={h.id} />)}
            </div>
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
