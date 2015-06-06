import fs       from 'fs';
import path     from 'path';
import google   from 'googleapis';
import examples from '../../config/examples';
import Promise  from 'bluebird';

const EXAMPLE_QUERIES = examples.map((q) => q.sort().join(','));
const AUTH_PATH       = path.resolve(__dirname, '../../config/google.json');
const ENABLED         = fs.existsSync(AUTH_PATH);

var jwt, analytics;

function getAnalytics() {
    if (!(jwt && analytics) && ENABLED) {
        jwt = new google.auth.JWT();
        jwt.fromJSON(require(AUTH_PATH));
        jwt = Promise.promisifyAll(jwt.createScoped('https://www.googleapis.com/auth/analytics.readonly'));
        analytics = google.analytics({ version: 'v3', auth: jwt });

        Promise.promisifyAll(analytics.data.ga);
    }

    return jwt.authorizeAsync().then(() => analytics);
}


module.exports = {
    topSearches: function(params) {
        if (!ENABLED) {
            return Promise.resolve({error: {message: 'analytics not available'}});
        } else {
            return getAnalytics()
                .then((analytics) => {
                    return analytics.data.ga.getAsync({
                        ids: 'ga:98310771',
                        'start-date': params.days + 'daysAgo',
                        'end-date': 'today',
                        'max-results': params.limit,
                        metrics: 'ga:totalEvents',
                        dimensions: 'ga:eventAction',
                        sort: '-ga:totalEvents',
                        filters: 'ga:eventCategory==summary'
                    });
                })
                .spread((data) => {
                    let result = (data.rows || [])
                        .map(
                            (row) => ({query: row[0], count: +row[1]})
                        );

                    if (!params.examples) {
                        result = result.filter((r) => EXAMPLE_QUERIES.indexOf(r.query) === -1);
                    }

                    return {searches: result};
                });
        }
    }
};
