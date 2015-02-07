var Promise = require('bluebird');
var LRU     = require('lru-cache');
var es      = require('./es-client');
var debug   = require('debug')('elasticsearch');
var cache   = LRU({max: 500});

function countsFor(opts) {
    var cacheHit = cache.get(opts);

    if (cacheHit) {
        return Promise.resolve(cacheHit);
    } else {
        var body = {
            aggregations: {
                monthly: {
                    date_histogram: {
                        field: "time",
                        interval: opts.interval,
                        time_zone: 2
                    }
                }
            }
        };


        if (opts.query != '*') {
            body = {
                aggregations: {
                    monthly: {
                        aggs: body.aggregations,
                        filter: {
                            query: {
                                query_string: {
                                    query: opts.query,
                                    default_operator: 'AND'
                                }
                            }
                        }
                    }
                }
            };
        }

        body.size = 10;

        debug('request', JSON.stringify(body));

        return es.search({ index: 'hdo-transcripts', body: body })
            .then(function (response) {
                debug('response', JSON.stringify(response));

                var result = {};
                var counts = {};

                var agg     = response.aggregations.monthly;
                var buckets = agg.monthly ? agg.monthly.buckets : agg.buckets;

                buckets.forEach(function (bucket) {
                    counts[bucket.key_as_string] = bucket.doc_count;
                });

                result.counts = counts;
                result.hits = response.hits.hits;

                cache[opts] = result;

                return result;
            });
    }
}

function timeline(opts) {
    opts.interval = opts.interval || 'month';

    return Promise.join(
        countsFor({query: '*', interval: opts.interval} ),
        countsFor(opts)
    ).spread(function (allResults, queryResults) {
        var keys = Object.keys(allResults.counts);
        keys.pop(); // don't want current incomplete period

        var counts = keys.map(function (key) {
            var total = allResults.counts[key];
            var val = queryResults.counts[key] || 0.0;

            return {
                date: key,
                count: val,
                total: total,
                pct: (val / total) * 100
            };
        });

        return { counts: counts, hits: queryResults.hits };
    });
}

module.exports = {  timeline: timeline };