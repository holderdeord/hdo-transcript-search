import React     from 'react';
import SearchHit from './SearchHit';

class TopHits extends React.Component {
    constructor(props) {
        super(props);
        this.searchActions = props.flux.getActions('search');
    }

    render() {
        let result = this.props.hits;

        if (!result) {
            return null;
        }

        let hitText = `Viser ${result.hits.length} av totalt ${result.counts.total} treff på «${result.query}»`;
        let hasMore = result.hits.length < result.counts.total;

        return (
            <div className="card">
                <div className="row result-box">
                    <em>{hitText}</em>
                    <strong>TODO: filters</strong>:
                </div>

                {
                    result.hits.map((h, i) => [
                        <SearchHit hit={h} key={h.id} index={i}/>,
                        <div className="divider"/>
                    ])
                }

                {hasMore && this.renderLoadMore()}
            </div>
        );
    }

    renderLoadMore() {
        return (
            <div className="row text-center">
                <button
                    className="btn btn-primary"
                    onClick={this.handleLoadMore.bind(this)}
                    style={{margin: '1rem'}}>

                    Last flere
                </button>
            </div>
        );
    }

    handleLoadMore() {
        this.setState({loaded: false}, () => {
            this.searchActions.moreHits(this.props.hits.query, this.props.hits.hits.length);
        });
    }
}

TopHits.propTypes = {
};

module.exports = TopHits;
