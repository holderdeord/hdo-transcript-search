import Promise from 'bluebird';
import LRU from 'lru-cache';
import es from './es-client';
import debugg from 'debug';

var debug      = debugg('elasticsearch');
var debugCache = debugg('cache');

const INDEX_NAME = 'hdo-transcripts';
const INDEX_TYPE = 'speech';

class SearchAPI {
    constructor() {
        this.cache = LRU({max: 500});
    }

    search(opts) {
        opts.interval = opts.interval || 'month';

        return Promise.join(
            this._countsFor({query: '*', interval: opts.interval}),
            this._countsFor(opts)
        ).spread((allResults, queryResults) => {
            return {
                totalCount: allResults.total,
                hitCount: queryResults.total,
                counts: this._calculatePercentages(queryResults.counts, allResults.counts),
                hits: queryResults.hits,
                partyCounts: queryResults.parties,
                peopleCounts: queryResults.people
            };
        });
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
            size: end - start + 1
        };

        return es
            .search({index: INDEX_NAME, type: INDEX_TYPE, body: body})
            .then(response => response.hits.hits ? response.hits.hits.map(h => h._source) : []);
    }

    _calculatePercentages(subset, set) {
        return Object.keys(set).map(key => {
            var total = set[key];
            var val   = subset[key] || 0.0;

            return {
                date: key,
                count: val,
                total: total,
                pct: (val / total) * 100
            };
        });
    }

    _countsFor(opts) {
        var hit = this.cache.get(JSON.stringify(opts));

        if (hit) {
            debugCache('cache hit');
            return Promise.resolve(hit);
        } else {
            debugCache('cache miss');

            var body = opts.query === '*' ? this._totalsQuery(opts) : this._buildQuery(opts);

            debug('request', JSON.stringify(body));

            return es.search({ index: INDEX_NAME, body: body })
                .then(this._parseResponse.bind(this)).then(result => {
                    debugCache("caching response for", opts);

                    this.cache.set(JSON.stringify(opts), result);
                    return result;
                });
        }
    }

    _totalsQuery(opts) {
        return {
            aggregations: {
                monthly: {
                    date_histogram: {
                        field: "time",
                        interval: opts.interval,
                        time_zone: 2
                    }
                },

                parties: {
                    terms: {
                        field: 'party'
                    }
                },

                people: {
                    terms: {
                        field: 'name'
                    }
                }
            },
            size: 0
        };
    }

    _buildQuery(opts) {
        var body = this._totalsQuery(opts);

        var query = {
            query_string: {
                query: opts.query,
                default_operator: 'AND',
                default_field: 'text'
            }
        };

        return Object.assign(body, {
            aggregations: {
                monthly: {
                    filter: { query: query },
                    aggs: { monthly: body.aggregations.monthly }
                },
                parties: {
                    filter: { query: query },
                    aggs: { parties: body.aggregations.parties }
                },
                people: {
                    filter: { query: query },
                    aggs: { people: body.aggregations.people }
                }
            },
            highlight: {
                fields: { text: {} }
            },
            query: query,
            size: opts.size || 10,
            sort: '_score'
        });
    }

    _parseAggregation(response, key) {
        var counts = {};

        var agg     = response.aggregations[key];
        var buckets = agg[key] ? agg[key].buckets : agg.buckets;

        buckets.forEach(bucket => {
            counts[bucket.key_as_string || bucket.key] = bucket.doc_count;
        });

        return counts;
    }

    _parseResponse(response) {
        debug('response', JSON.stringify(response));

        var result = {
            counts: this._parseAggregation(response, 'monthly'),
            hits: response.hits.hits,
            total: response.hits.total
        };


        if (response.aggregations.parties) {
            result.parties = this._parseAggregation(response, 'parties');
        }

        if (response.aggregations.people) {
            result.people = this._parseAggregation(response, 'people');
        }

        return result;
    }


}

module.exports = new SearchAPI();
