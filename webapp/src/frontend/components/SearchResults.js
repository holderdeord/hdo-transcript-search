import React  from 'react';
import Speech from './Speech';
import Icon   from 'react-fa';
import UrlUtils from '../../shared/UrlUtils';

export default class SearchResults extends React.Component {
    constructor(props) {
        super(props);
        // this.searchActions = props.flux.getActions('search');
        this.state = { loaded: true };
    }

    componentWillReceiveProps(newProps) {
        let oldHits = this.getFocusedHitSet();
        let newHits = this.getFocusedHitSet(newProps);

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
                <div className="row result-box result-box-header">
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

                {hasMore && this.renderLoadMore()}

                <div className="row" style={{padding: '1rem'}}>
                    <div className="export-links">
                        <div className="inner">
                            <div>
                                <a href={UrlUtils.csvPathForQuery(result.query)}>
                                    Last ned <strong>{result.counts.total}</strong> innlegg som CSV
                                    <span style={{paddingLeft: '.5rem'}}>
                                        <Icon name="download" />
                                    </span>
                                </a>
                            </div>

                            <div>

                            <a href={UrlUtils.rssPathForQuery(result.query)}>
                                RSS for dette søket
                                <span style={{paddingLeft: '.5rem'}}>
                                    <Icon name="rss" />
                                </span>
                            </a>
                            </div>
                        </div>
                    </div>

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
        let el = null;

        if (this.state.loaded) {
            el = (
                <button className="btn btn-primary"
                        onClick={::this.handleLoadMore}>
                    Vis flere innlegg
                </button>
            );
        } else {
            el = (
                <Icon spin name="refresh" style={{margin: '1rem', fontSize: '2rem'}}/>
            );
        }

        return (
            <div className="row" style={{paddingTop: '1rem'}}>
                <div className="text-center">
                    {el}
                </div>
            </div>
        );
    }

    handleLoadMore() {
        let result = this.getFocusedHitSet();

        if (result) {
            this.setState({loaded: false}, () => {
                this.searchActions.moreHits(result.query, result.hits.length);
            });
        }
    }

    getFocusedHitSet(props) {
        props = props || this.props;
        let hits = props.hits;

        if (hits) {
            return hits[props.focusedIndex || 0];
        } else {
            return null;
        }
    }
}
