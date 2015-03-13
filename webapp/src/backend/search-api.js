import Promise from 'bluebird';
import LRU     from 'lru-cache';
import es      from './es-client';
import debug   from 'debug';
import moment  from 'moment';

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
                // TODO: replace this second query with top_hits:
                // http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-aggregations-metrics-top-hits-aggregation.html
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

    _calculatePercentages(subset, set, opts = {}) {
        var keys;

        if (opts && opts.combineKeys) {
            keys = Object.keys(subset).concat(Object.keys(set));
            keys = keys.filter((k, i) => keys.indexOf(k) === i); // index
        } else {
            keys = Object.keys(subset);
        }

        return keys.map(key => {
            let total = set[key] || 0.0;
            let val   = subset[key] || 0.0;

            return {
                key: key,
                count: val,
                total: total,
                pct: total === 0 ? 0 : (val / total) * 100
            };
        });
    }

    _buildPersonMap(aggregation) {
        let map = {};

        aggregation.buckets.forEach(bucket => {
            map[bucket.key] = bucket.person.hits.hits[0]._source;
        });

        return map;
    }

    _buildResponse(aggResponse, hitsResponse) {
        let personMap = this._buildPersonMap(aggResponse.aggregations.filteredPeople.people);

        let people = this._calculatePercentages(
            this._parseAggregation(aggResponse.aggregations.filteredPeople.people),
            this._parseAggregation(aggResponse.aggregations.people)
        );

        people.forEach(d => d.meta = personMap[d.key]);

        let timeline = this._calculatePercentages(
            this._parseAggregation(aggResponse.aggregations.filteredTimeline.timeline),
            this._parseAggregation(aggResponse.aggregations.timeline),
            {combineKeys: true}
        );

        timeline.sort((a,b) => {
            return moment(a.key).valueOf() - moment(b.key).valueOf();
        });

        // we remove the last data point since it is incomplete and may cause odd outliers
        timeline = timeline.slice(0, -1);

        let parties = this._calculatePercentages(
            this._parseAggregation(aggResponse.aggregations.filteredParties.parties),
            this._parseAggregation(aggResponse.aggregations.parties)
        );

        return {
            counts: {
                total: aggResponse.hits.total,
                hits: hitsResponse.hits.total,
                pct: (hitsResponse.hits.total / aggResponse.hits.total) * 100
            },
            hits: hitsResponse.hits.hits.map(this._buildHit),
            timeline: timeline,
            parties: parties,
            people: {
                count: people.sort((a,b) => b.count - a.count).slice(0, 20),
                pct: people.sort((a,b) => b.pct - a.pct).slice(0, 20)
            }
        };
    }

    _buildHit(hit) {
        return Object.assign({
            id: hit._id,
            score: hit._score,
            highlight: hit.highlight ? hit.highlight.text[0] : ''
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
            query: this._queryFor(opts.query),
            highlight: {
                pre_tags: ['<mark>'],
                post_tags: ['</mark>'],
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
        var query = this._queryFor(opts.query);

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
                        significant_terms: {
                            field: 'name',
                            size: 0
                        },
                        aggs: {
                            person: {
                                top_hits: {
                                    size: 1,
                                    _source: { include: ["external_id", "party"] }
                                }
                            }
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

    _queryFor(str) {
        return {
            query_string: {
                query: str,
                default_operator: 'AND',
                default_field: 'text'
            }
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
