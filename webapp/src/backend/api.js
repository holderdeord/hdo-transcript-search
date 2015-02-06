var Promise = require('bluebird');
var LRU     = require('lru-cache');
var es      = require('./es-client');
var config  = require('../../config');
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

        body.size = 0;

        return es.search({ index: 'hdo-transcripts', body: body })
            .then(function (response) {
                var result = {};

                var agg     = response.aggregations.monthly;
                var buckets = agg.monthly ? agg.monthly.buckets : agg.buckets;

                buckets.forEach(function (bucket) {
                    result[bucket.key_as_string] = bucket.doc_count;
                });

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
    ).spread(function (totals, counts) {
        var keys = Object.keys(totals);
        keys.pop(); // don't want current incomplete period

        return keys.map(function (key) {
            var total = totals[key];
            var val = counts[key] || 0.0;

            return {
                date: key,
                count: val,
                total: total,
                pct: (val / total) * 100
            };
        });
    });
}

function randomTimeline() {
    var ts        = new Date(1998, 9, 1).getTime();
    var sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
    var result    = [];

    for (var i = 0, l = 32; i < l; i++) {
        var val = Math.random() * 500;
        var total = Math.random() * 500 + val;

        result.push({
            date: new Date(ts).toISOString(),
            count: val,
            total: total,
            pct: (val / total) * 100
        });

        ts += sixMonths;
    }

    return Promise.resolve(result);
}


module.exports = {  timeline: config.get('fake') ? randomTimeline : timeline };