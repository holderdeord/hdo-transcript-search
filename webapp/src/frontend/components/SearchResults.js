import React, { Component, PropTypes } from 'react';
import Speech from './Speech';
import UrlUtils from '../../shared/UrlUtils';
import { connect } from 'react-redux';
import { moreHits } from '../actions/SearchActions';

@connect(state => ({ hits: state.hits.hits }))
export default class SearchResults extends Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    };

    static propTypes = {};

    state = { loaded: true };

    componentWillReceiveProps(newProps) {
        let oldHits = this.getFocusedHitSet();
        let newHits = this.getFocusedHitSet(newProps);

        if (oldHits && newHits && newHits.hits.length >= oldHits.hits.length) {
            this.setState({ loaded: true });
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

                {result.hits.map((h, i) => [
                    <Speech speech={h} key={h.id} index={i} />,
                    <div className="divider" />,
                ])}

                <div className="row" style={{ padding: '1rem' }}>
                    <div className="col-md-4 col-md-offset-4">
                        {hasMore && this.renderLoadMore()}

                        <div className="text-center">
                            <small
                                className="text-muted"
                                style={{ marginLeft: '1rem' }}>
                                Viser {result.hits.length} av totalt{' '}
                                {result.counts.total} treff på{' '}
                                <strong>{result.query}</strong>
                            </small>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="export-links">
                            <div>
                                <a href={UrlUtils.csvPathForQuery(result.query)}>
                                    Last ned <strong>{result.counts.total}</strong>{' '}
                                    innlegg som CSV
                                    <span style={{ paddingLeft: '.5rem' }}>
                                        <i className="fa fa-download" />
                                    </span>
                                </a>
                            </div>

                            <div>
                                <a href={UrlUtils.rssPathForQuery(result.query)}>
                                    RSS for dette søket
                                    <span style={{ paddingLeft: '.5rem' }}>
                                        <i className="fa fa-rss" />
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderLoadMore() {
        let el = null;

        if (this.state.loaded) {
            el = (
                <button className="btn btn-primary" onClick={::this.handleLoadMore}>
                    Vis flere innlegg
                </button>
            );
        } else {
            el = (
                <i
                    className="fa fa-refresh fa-spin"
                    style={{ margin: '1rem', fontSize: '2rem' }}
                />
            );
        }

        return <div className="text-center">{el}</div>;
    }

    handleLoadMore() {
        let result = this.getFocusedHitSet();

        if (result) {
            this.setState({ loaded: false }, () => {
                this.context.store.dispatch(
                    moreHits(result.query, result.hits.length)
                );
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
