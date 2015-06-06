import fs       from 'fs';
import path     from 'path';
import google   from 'googleapis';
import examples from '../../config/examples';
import Promise  from 'bluebird';

const GA_ID           = 'ga:98310771'
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


function topSearches(params) {
    return getAnalytics()
        .then((analytics) => {
            return analytics.data.ga.getAsync({
                ids: GA_ID,
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
                .map((row) => ({query: row[0], count: +row[1]}));

            if (!params.examples) {
                result = result.filter((r) => EXAMPLE_QUERIES.indexOf(r.query) === -1);
            }

            return {searches: result};
        });
}

function imageErrors() {
    return getAnalytics().then((analytics) => {
        return analytics.data.ga.getAsync({
            ids: GA_ID,
            'start-date': '30daysAgo',
            'end-date': 'today',
            'max-results': 500,
            metrics: 'ga:totalEvents',
            dimensions: 'ga:eventAction',
            sort: '-ga:totalEvents',
            filters: 'ga:eventCategory==image-error'
        }).spread((data) => {

            let result = (data.rows || []).map((row) => {
                return {id: row[0], count: +row[1]};
            });

            return {imageErrors: result}
        });
    });
}

function checkEnabled(func, ...rest) {
    if (ENABLED) {
        return func(...rest);
    } else {
        return Promise.resolve({error: {message: 'analytics not available'}});
    }
}

module.exports = {
    topSearches: checkEnabled.bind(null, topSearches),
    imageErrors: checkEnabled.bind(null, imageErrors)
};
