import express from 'express';
import logger from 'morgan';
import api from './search-api';
import config from '../../config';
import path from 'path';

var app = express();

// config
app.use(logger('short'));
app.set('port', config.get('PORT'));
app.disable('x-powered-by');

if(app.get('env') === 'development') {
    app.use(require('errorhandler')());

    var webpack           = require('webpack');
    var webpackMiddleware = require('webpack-dev-middleware');
    var webpackConf       = require('../../webpack.config');

    app.use(webpackMiddleware(webpack(webpackConf)));
}

app.use(express.static(path.resolve(__dirname, '../../public')));

// routes
app.get('/api/search', (req, res) => {
    if (req.query.query) {
        api.search(req.query).then(results => { res.json(results); });
    } else {
        res.status(400).json({error: "missing query param"});
    }
});

app.get('/api/speeches/:id', (req, res) => {
    api.getSpeech(req.params.id)
        .then(results => { res.json(results); })
        .catch(err => { res.status(500).json({error: err});
    });
});

module.exports = app;
