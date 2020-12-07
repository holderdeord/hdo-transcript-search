var nconf = require('nconf');

var elasticsearch = 'localhost:9200';

if (process.env.ELASTICSEARCH_HOST && process.env.ELASTICSEARCH_PORT) {
    elasticsearch = [
        process.env.ELASTICSEARCH_HOST,
        process.env.ELASTICSEARCH_PORT,
    ].join(':');
}

nconf.argv().env().defaults({
    HTTP_PORT: 7575,
    NODE_ENV: 'dev',
    elasticsearch: elasticsearch,
});

module.exports = nconf;
