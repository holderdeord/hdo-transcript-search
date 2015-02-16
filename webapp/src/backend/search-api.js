import Promise from 'bluebird';
import LRU from 'lru-cache';
import es from './es-client';
import debug from 'debug';

var debugCache = debug('cache');

const INDEX_NAME        = 'hdo-transcripts';
const INDEX_TYPE        = 'speech';
const ALLOWED_INTERVALS = ['month', '12w', '24w', 'year'];

class SearchAPI {
    constructor() {
        this.cache = LRU({max: 500});
    }

    search(opts) {
        try {
            opts.interval = this._intervalFrom(opts);
        } catch (e) {
            return Promise.reject(e);
        }

        let cacheKey = JSON.stringify(opts);
        let hit      = this.cache.get(cacheKey);

        if (hit) {
            debugCache('cache hit');
            return Promise.resolve(hit);
        } else {
            debugCache('cache miss');

            var promise = Promise.join(
                es.search(this._buildAggregationsQuery(opts)),
                es.search(this._buildHitsQuery(opts))
            );

            return promise
                .spread(this._buildResponse.bind(this))
                .then(this._cacheResponse.bind(this, cacheKey));
        }

    }

    getSpeech(id) {
        return es
            .get({index: INDEX_NAME, type: INDEX_TYPE, id: id})
            .then(response => response._source);
    }

    getContext(id, start, end) {
        var body = {
            filter: {
                and: {
                    filters: [
                        {term: {transcript: id}},
                        {range: {order: {gte: start, lte: end}}}
                    ]
                }
            },
            size: end - start + 1,
            sort: 'order'
        };

        return es
            .search({index: INDEX_NAME, type: INDEX_TYPE, body: body})
            .then(response => response.hits.hits ? response.hits.hits.map(h => h._source) : []);
    }

    _cacheResponse(key, value) {
        this.cache.set(key, value);
        return value;
    }

    _calculatePercentages(subset, set) {
        return Object.keys(subset).map(key => {
            let total = set[key];
            let val   = subset[key];

            if (total && val) {
                return {
                    key: key,
                    count: val,
                    total: total,
                    pct: (val / total) * 100
                };
            } else {
                throw new Error(`missing values for ${key}: total=${total} val=${val}`);
            }
        });
    }

    _buildResponse(aggResponse, hitsResponse) {
        return {
            counts: {
                total: aggResponse.hits.total,
                hits: hitsResponse.hits.total,
                pct: (hitsResponse.hits.total / aggResponse.hits.total) * 100
            },
            hits: hitsResponse.hits.hits.map(this._buildHit),
            timeline: this._calculatePercentages(
                this._parseAggregation(aggResponse.aggregations.filteredTimeline.timeline),
                this._parseAggregation(aggResponse.aggregations.timeline)
            ),
            parties: this._calculatePercentages(
                this._parseAggregation(aggResponse.aggregations.filteredParties.parties),
                this._parseAggregation(aggResponse.aggregations.parties)
            ),
            people: this._calculatePercentages(
                this._parseAggregation(aggResponse.aggregations.filteredPeople.people),
                this._parseAggregation(aggResponse.aggregations.people)
            )
        };
    }

    _buildHit(hit) {
        return Object.assign({
            id: hit._id,
            score: hit._score,
            highlight: hit.highlight ? hit.highlight.text.join(' ') : ''
        }, hit._source);
    }

    _intervalFrom(opts) {
        let interval = opts.interval || 'month';

        // very small intervals can cause a performance hit (huge timeline)
        if (ALLOWED_INTERVALS.indexOf(interval) === -1)  {
            throw new Error(`invalid interval: ${interval}`);
        }

        return interval;
    }

    _buildHitsQuery(opts) {
        var body = {
            query: {
                query_string: {
                    query: opts.query,
                    default_operator: 'AND',
                    default_field: 'text'
                }
            },
            highlight: {
                fields: { text: {} }
            },
            size: opts.size || 10,
            sort: '_score'
        };

        return {
            index: INDEX_NAME,
            type: INDEX_TYPE,
            body: body
        };
    }

    _buildAggregationsQuery(opts) {
        var query = {
            query_string: {
                query: opts.query,
                default_operator: 'AND',
                default_field: 'text'
            }
        };

        var aggregations = {
            timeline: {
                date_histogram: {
                    field: "time",
                    interval: opts.interval,
                    time_zone: 2
                }
            },

            parties: {
                terms: {
                    field: 'party',
                    size: 0
                }
            },

            people: {
                terms: {
                    field: 'name',
                    size: 0
                }
            }
        };

        Object.assign(aggregations, {
            filteredTimeline: {
                filter: { query: query },
                aggregations: { timeline: aggregations.timeline }
            },

            filteredParties: {
                filter: { query: query },
                aggs: { parties: aggregations.parties }
            },

            filteredPeople: {
                filter: { query: query },
                aggs: {
                    people: {
                        terms: {
                            field: 'name',
                            size: opts.size || 10
                        }
                    }
                }
            }
        });

        var body = {
            aggregations: aggregations,
            size: 0
        };

        return {
            index: INDEX_NAME,
            type: INDEX_TYPE,
            body: body
        };
    }

    _parseAggregation(aggregation) {
        var counts = {};
        var buckets = aggregation.buckets;
        var bucket;

        for (var i = 0, l = buckets.length; i < l; i++) {
            bucket = buckets[i];
            counts[bucket.key_as_string || bucket.key] = bucket.doc_count;
        }

        return counts;
    }

}

module.exports = new SearchAPI();
