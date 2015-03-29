import React from 'react';
import SearchHit from './SearchHit';

class TopHits extends React.Component {

    render() {
        let q      = this.props.focusedQuery;
        let result = this.props.results[this.props.queries.indexOf(q)];

        if (result) {
            let pct    = result.result.counts.pct.toFixed(2);
            let hits   = result.result.counts.hits;
            let total  = result.result.counts.total;
            let hitText = `Fant «${q}» i ${pct}% (${hits} / ${total}) av innlegg.`;

            return (
                <div className="card">
                    <div className="row result-box">
                        <h3>Treff</h3>

                        <em>{hitText}</em>

                        <strong>TODO</strong>:
                        sortering, filtrering på år, person, parti? Last mer-knapp.
                    </div>

                    {
                        result.result.hits.map(h => [
                            <SearchHit hit={h} key={h.id} />,
                            <div className="divider"/>
                        ])
                    }
                </div>
            );
        } else {
            return <div/>;
        }
    }
}

TopHits.propTypes = {
};

module.exports = TopHits;
