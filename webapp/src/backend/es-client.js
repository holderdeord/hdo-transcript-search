import es from 'elasticsearch';
import config from '../../config';

module.exports = new es.Client({
    host: config.get('elasticsearch'),
    log: 'info'
});
