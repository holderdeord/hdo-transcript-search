import React  from 'react';
import Speech from './Speech';
import Icon   from 'react-fa';

class TopHits extends React.Component {
    constructor(props) {
        super(props);
        this.searchActions = props.flux.getActions('search');
        this.state = { loaded: true };
    }

    componentWillReceiveProps(newProps) {
        let oldHits = this.getFocusedHitSet();
        let newHits = this.getFocusedHitSet(newProps.hits);

        if (oldHits && newHits && newHits.hits.length >= oldHits.hits.length) {
            this.setState({loaded: true});
        }
    }

    render() {
        let result = this.getFocusedHitSet();

        if (!result) {
            return null;
        }

        let hasMore = result.hits.length < result.counts.total;

        return (
            <div className="card">
                <div className="row result-box">
                    <div className="col-md-12">
                        <h4 className="text-center">
                            Innlegg der «{result.query}» er nevnt
                        </h4>
                    </div>
                </div>

                {
                    result.hits.map((h, i) => [
                        <Speech speech={h} key={h.id} index={i}/>,
                        <div className="divider"/>
                    ])
                }

                <div className="row" style={{padding: '1rem'}}>
                    <small className="export-links">
                        <a href={this.getExportUrlFor(result.query)}>
                            <span style={{paddingRight: '.5rem'}}>
                                <Icon name="download" />
                            </span>


                            Last ned <strong>{result.counts.total}</strong> innlegg som CSV
                        </a>
                    </small>

                    <div className="text-center">
                        {hasMore && this.renderLoadMore()}
                    </div>
                </div>

                <div className="row">
                    <div className="text-center">
                        <small className="text-muted" style={{marginLeft: '1rem'}}>
                            Viser {result.hits.length} av totalt {result.counts.total} treff på <strong>{result.query}</strong>
                        </small>
                    </div>
                </div>
            </div>
        );
    }

    renderLoadMore() {
        if (this.state.loaded) {
            return (
                <button
                    className="btn btn-primary"
                    onClick={this.handleLoadMore.bind(this)}
                    >
                    Vis flere innlegg
                </button>
            );
        } else {
            return (
                <Icon spin name="refresh" style={{margin: '1rem', fontSize: '2rem'}}/>
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

    getExportUrlFor(query) {
        return `/api/export?query=${encodeURIComponent(query)}&format=csv&sort=time.desc`
    }

    getFocusedHitSet(optionalHits) {
        let hits = optionalHits || this.props.hits;

        if (hits) {
            return hits[this.props.focusedIndex || 0];
        } else {
            return null;
        }
    }
}

TopHits.propTypes = {
};

module.exports = TopHits;
