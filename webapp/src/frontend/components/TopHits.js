import React     from 'react';
import SearchHit from './SearchHit';
import Icon      from 'react-fa';

class TopHits extends React.Component {
    constructor(props) {
        super(props);
        this.searchActions = props.flux.getActions('search');
        this.state = { loaded: true };
    }

    componentWillReceiveProps(newProps) {
        let oldHits = this.getFocusedHitSet(newProps);
        let newHits = this.getFocusedHitSet(this.props);

        if (oldHits && newHits && newHits.hits.length >= oldHits.hits.length) {
            this.setState({loaded: true});
        }
    }

    render() {
        let result = this.getFocusedHitSet();

        if (!result) {
            return null;
        }

        let hitText = `Viser ${result.hits.length} av totalt ${result.counts.total} treff på «${result.query}»`;
        let hasMore = result.hits.length < result.counts.total;

        return (
            <div className="card">
                <div className="row result-box">
                    <div className="col-md-12">
                        <h2>Treff</h2>
                        <em>{hitText}</em>
                    </div>
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
        if (this.state.loaded) {
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
        } else {
            return (
                <div className="row text-center">
                    <Icon spin name="spinner" style={{margin: '1rem', fontSize: '2rem'}}/>
                </div>
            );
        }
    }

    handleLoadMore() {
        let result = this.getFocusedHitSet();

        if (result) {
            this.setState({loaded: false}, () => {
                this.searchActions.moreHits(result.query, result.hits.length);
            });
        }
    }

    getFocusedHitSet(optionalHits) {
        let hits = optionalHits || this.props.hits;

        if (this.props.hits) {
            return this.props.hits[this.props.focusedIndex || 0];
        } else {
            return null;
        }
    }
}

TopHits.propTypes = {
};

module.exports = TopHits;
