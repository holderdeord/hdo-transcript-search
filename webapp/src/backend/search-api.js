/* eslint-disable camelcase */

import Promise            from 'bluebird';
import LRU                from 'lru-cache';
import es                 from './es-client';
import debug              from 'debug';
import moment             from 'moment';
import { ReadableSearch } from 'elasticsearch-streams';
import csv                from 'csv';
import Parties            from '../shared/Parties';

var debugCache = debug('cache');

const INDEX_NAME        = 'hdo-transcripts';
const INDEX_TYPE        = 'speech';
const ALLOWED_INTERVALS = ['month', '12w', '24w', 'year'];
const TSV_HEADERS       = ['transcript', 'order', 'session', 'time', 'title', 'name', 'party', 'text'];

const MIN_SPEECH_COUNT = require('../shared/minSpeechCount');

class SearchAPI {
    cache = LRU({max: 500}); // eslint-disable-line

    summary(opts) {
        opts.interval = this._intervalFrom(opts);

        return this.cached('summary', opts, () => {
            return es
                .search(this._buildAggregationsQuery(opts))
                .then(::this._buildResponse);
        });
    }

    hits(opts) {
        opts.interval = this._intervalFrom(opts);

        return this.cached('hits', opts, () => {
            return es.search(this._buildHitsQuery(opts)).then((response) => {
                return {
                    query: opts.query,
                    hits: response.hits.hits.map((h) => this._buildHit(h)),
                    counts: {
                        total: response.hits.total
                    }
                };
            });
        });
    }

    cached(name, data, fetchFunc) {
        let cacheKey = name + ':' + JSON.stringify(data);
        let hit      = this.cache.get(cacheKey);

        if (hit) {
            debugCache('cache hit');

            return Promise.resolve(hit);
        } else {
            debugCache('cache miss');

            return fetchFunc()
                .then(this._cacheResponse.bind(this, cacheKey));
        }
    }

    getHitStream(opts) {
        let delimiter = opts.format === 'csv' ? ',' : '\t';

        let rs = new ReadableSearch((start, callback) => {
            let q = this._buildHitsQuery(Object.assign({}, opts, {start: start, highlight: false, size: 500}));
            es.search(q, callback);
        });

        return rs
                .pipe(csv.transform(record => {
                    record._source.text = record._source.text.replace(/\n/g, ' ');
                    return TSV_HEADERS.map(k => record._source[k]);
                }))
                .pipe(csv.stringify({
                    delimiter: delimiter,
                    header: true,
                    columns: TSV_HEADERS
                }));
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
            .then(response => {
                if (response.hits.hits) {
                    return response.hits.hits.map(h => Object.assign(h._source, {id: h._id}));
                } else {
                    return [];
                }
            });
    }

    getLixStats() {
        return es.search({
            index: INDEX_NAME,
            type: INDEX_TYPE,
            body: {
                size: 0,
                aggs: {
                    scoreStats: {
                        stats: {
                            field: 'lix.score'
                        }
                    },

                    parties: {
                        terms: {
                            field: 'party',
                            size: 20
                        },

                        aggs: {
                            scoreStats: {
                                stats: {
                                    field: 'lix.score'
                                }
                            },

                            timeline: {
                                date_histogram: {
                                    field: 'time',
                                    interval: 'year',
                                    time_zone: 'Europe/Oslo',
                                    format: 'yyyy-MM-dd',
                                    min_doc_count: 0
                                },

                                aggs: {
                                    scoreStats: {
                                        stats: {
                                            field: 'lix.score'
                                        }
                                    }
                                }
                            }
                        }
                    },

                    topRepresentatives: {
                        terms: {
                            field: 'name',
                            size: 20,
                            order: { avgLixScore: 'desc' },
                            min_doc_count: MIN_SPEECH_COUNT
                        },

                        aggs: {
                            avgLixScore: {
                                avg: {
                                    field: 'lix.score'
                                }
                            },

                            person: {
                                top_hits: { // eslint-disable-line
                                    size: 1,
                                    _source: { include: ['external_id', 'party'] }
                                }
                            }
                        }
                    },

                    bottomRepresentatives: {
                        terms: {
                            field: 'name',
                            size: 20,
                            order: { avgLixScore: 'asc' },
                            min_doc_count: MIN_SPEECH_COUNT
                        },

                        aggs: {
                            avgLixScore: {
                                avg: {
                                    field: 'lix.score'
                                }
                            },

                            person: {
                                top_hits: { // eslint-disable-line
                                    size: 1,
                                    _source: { include: ['external_id', 'party'] }
                                }
                            }
                        }
                    },

                    timeline: {
                        date_histogram: {
                            field: 'time',
                            interval: 'year',
                            time_zone: 'Europe/Oslo',
                            format: 'yyyy-MM-dd',
                            min_doc_count: 0
                        },

                        aggs: {
                            scoreStats: {
                                stats: {
                                    field: 'lix.score'
                                }
                            }
                        }
                    }

                }
            }
        })
        .then(res => res.aggregations);
    }

    _cacheResponse(key, value) {
        this.cache.set(key, value);
        return value;
    }

    _calculatePercentages(subset, set, opts = {}) {
        var keys;

        if (opts && opts.combineKeys) {
            keys = Object.keys(subset).concat(Object.keys(set));

            // unique
            keys = keys.filter((k, i) => keys.indexOf(k) === i);
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

    _buildResponse(aggResponse) {
        let personMap = this._buildPersonMap(aggResponse.aggregations.filteredPeople.people);

        let people = this._calculatePercentages(
            this._parseAggregation(aggResponse.aggregations.filteredPeople.people),
            this._parseAggregation(aggResponse.aggregations.people)
        );

        people.forEach(d => {
            d.meta = personMap[d.key];
        });

        let timeline = this._calculatePercentages(
            this._parseAggregation(aggResponse.aggregations.filteredTimeline.timeline),
            this._parseAggregation(aggResponse.aggregations.timeline),
            {combineKeys: true}
        );

        timeline.sort((a, b) => {
            return moment(a.key).valueOf() - moment(b.key).valueOf();
        });

        // We remove the first and last data point since
        // they are incomplete and may look very odd.
        // TODO: look into grouping on parliament session instead of year
        timeline = timeline.slice(1, -1);

        let parties = this._calculatePercentages(
            this._parseAggregation(aggResponse.aggregations.filteredParties.parties),
            this._parseAggregation(aggResponse.aggregations.parties)
        ).filter(e => Parties.isCurrent(e.key));

        return {
            counts: {
                total: aggResponse.hits.total
            },
            timeline: timeline,
            parties: parties,
            people: {
                count: people
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 20),
                pct: people
                    .filter(d => d.total > MIN_SPEECH_COUNT)
                    .sort((a, b) => b.pct - a.pct)
                    .slice(0, 20)
            }
        };
    }

    _buildHit(hit) {
        return Object.assign({
            id: hit._id,
            score: hit._score,
            highlight: hit.highlight
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
            filter: this._filterFor(opts),

            size: +(opts.size || 10),
            from: +(opts.start || 0),
            sort: this._parseSortOption(opts.sort)
        };

        if (opts.highlight !== false) {
            body.highlight = {
                /*eslint-disable*/
                pre_tags: ['<mark>'],
                post_tags: ['</mark>'],
                fields: {
                    text: {
                        number_of_fragments: +(opts.fragments || 0)
                    }
                }
                /*eslint-enable*/
            };
        }

        return {
            index: INDEX_NAME,
            type: INDEX_TYPE,
            body: body
        };
    }

    _parseSortOption(str) {
        if (!str) {
            return '_score';
        }

        let m = str.match(/^(.+?)\.(asc|desc)$/);

        if (m) {
            return [
                {[m[1]]: m[2]},
                '_score'
            ];
        } else {
            return str;
        }
    }

    _buildAggregationsQuery(opts) {
        var query = this._queryFor(opts.query);

        var aggregations = {
            timeline: {
                // could do a terms aggregation on "session" instead
                date_histogram: {
                    field: 'time',
                    interval: opts.interval,
                    time_zone: 'Europe/Oslo',
                    format: 'yyyy-MM-dd',
                    min_doc_count: 0
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
                            size: 0
                        },
                        aggs: {
                            person: {
                                top_hits: { // eslint-disable-line
                                    size: 1,
                                    _source: { include: ['external_id', 'party'] }
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
        /*eslint-disable*/
        return {
            query_string: {
                query: str,
                default_operator: 'AND',
                default_field: 'text'
            }
        };
        /*eslint-enable*/
    }

    _filterFor(opts) {
        if (opts.includePresident) {
            return {};
        } else {
            return {
                not: {
                    filter: {
                        term: { name: 'Presidenten' }
                    }
                }
            };
        }
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
