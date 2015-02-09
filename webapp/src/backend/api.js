import Promise from 'bluebird';
import LRU from 'lru-cache';
import es from './es-client';
import debugg from 'debug';

var debug      = debugg('elasticsearch');
var debugCache = debugg('cache');
var cache      = LRU({max: 500});
var INDEX_NAME = 'hdo-transcripts';

var parseAggregation = (response, key) => {
    var counts = {};

    var agg     = response.aggregations[key];
    var buckets = agg[key] ? agg[key].buckets : agg.buckets;

    buckets.forEach(bucket => {
        counts[bucket.key_as_string || bucket.key] = bucket.doc_count;
    });

    return counts;
};

var parseResponse = response => {
    debug('response', JSON.stringify(response));

    var result = {};

    result.counts = parseAggregation(response, 'monthly');
    result.hits = response.hits.hits;
    result.total = response.hits.total;

    if (response.aggregations.parties) {
        result.parties = parseAggregation(response, 'parties');
    }

    if (response.aggregations.people) {
        result.people = parseAggregation(response, 'people');
        // if (result.people.Presidenten) {
        //     delete result.people.Presidenten;
        // } else {
        //     var names = Object.keys(result.people);
        //     delete result.people[names[names.length - 1]];
        // }
    }

    return result;
};


var buildQuery = opts => {
    var aggregations = {
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
    };


    var body = {
        aggregations: aggregations,
        size: 0
    };


    if (opts.query != '*') {
        var query = {
            query_string: {
                query: opts.query,
                default_operator: 'AND',
                default_field: 'text'
            }
        };

        body = {
            aggregations: {
                monthly: {
                    filter: { query: query },
                    aggs: { monthly: aggregations.monthly }
                },
                parties: {
                    filter: { query: query },
                    aggs: { parties: aggregations.parties }
                },
                people: {
                    filter: { query: query },
                    aggs: { people: aggregations.people }
                }
            }
        };

        body.highlight = { fields: { text: {} } };

        body.query = query;
        body.size = 10;
        body.sort = '_score';
    }

    return body;
};

var countsFor = opts => {
    var cacheHit = cache.get(JSON.stringify(opts));

    if (cacheHit) {
        debugCache('cache hit');
        return Promise.resolve(cacheHit);
    } else {
        debugCache('cache miss');

        var body = buildQuery(opts);

        debug('request', JSON.stringify(body));

        return es.search({ index: INDEX_NAME, body: body })
            .then(parseResponse).then(function (result) {
                debugCache("caching response for", opts);

                cache.set(JSON.stringify(opts), result);
                return result;
            });
    }
};


module.exports = {
    search: opts => {
        opts.interval = opts.interval || 'month';

        return Promise.join(
            countsFor({query: '*', interval: opts.interval} ),
            countsFor(opts)
        ).spread((allResults, queryResults) => {
            var keys = Object.keys(allResults.counts);

            var counts = keys.map(key => {
                var total = allResults.counts[key];
                var val   = queryResults.counts[key] || 0.0;

                return {
                    date: key,
                    count: val,
                    total: total,
                    pct: (val / total) * 100
                };
            });

            return {
                totalCount: allResults.total,
                hitCount: queryResults.total,
                counts: counts,
                hits: queryResults.hits,
                partyCounts: queryResults.parties,
                peopleCounts: queryResults.people
            };
        });
    },

    getSpeech: id => {
        return es
            .get({ index: INDEX_NAME, type: 'speech', id: id })
            .then(response => { return response._source;});
    }
};
