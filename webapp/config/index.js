var nconf = require('nconf');

nconf
    .argv()
    .env()
    .defaults({
        PORT: 7575,
        NODE_ENV: 'dev',
        elasticsearch: 'localhost:9200'
    });

module.exports = nconf;