import React from 'react';
import SearchHit from './SearchHit';

class TopHits extends React.Component {

    render() {
        let result = this.props.hits;

        if (!result) {
            return null;
        }

        let hitText = `Viser ${result.hits.length} av totalt ${result.counts.total} treff på «${result.query}»`;

        return (
            <div className="card">
                <div className="row result-box">
                    <h3>Treff</h3>

                    <em>{hitText}</em>

                    <strong>TODO</strong>:
                    sortering, filtrering på år, person, parti? Last mer-knapp.
                </div>

                {
                    result.hits.map(h => [
                        <SearchHit hit={h} key={h.id} />,
                        <div className="divider"/>
                    ])
                }
            </div>
        );
    }
}

TopHits.propTypes = {
};

module.exports = TopHits;
