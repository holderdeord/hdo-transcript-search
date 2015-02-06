var es      = require('elasticsearch');
var config  = require('../../config');

module.exports = new es.Client({
    host: config.get('elasticsearch'),
    log: 'info'
});
