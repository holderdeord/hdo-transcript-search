import express from 'express';
import logger from 'morgan';
import hbs from 'express-hbs';
import api from './search-api';
import config from '../../config';
import path from 'path';

function errorHandler(err) {
    return this.status(500).json({error: err.toString(),stack: err.stack.split('\n')});
}

var app = express();

// config
app.use(logger('short'));
app.set('port', +config.get('PORT'));
app.disable('x-powered-by');
app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, '../../views'));

app.locals.appTitle = 'Fra Stortingets talerstol';
app.locals.appDescription = 'En visualisering av språkbruk på Stortinget fra Holder de ord';

if(app.get('env') === 'development') {
    app.use(require('errorhandler')());

    var webpack           = require('webpack');
    var webpackMiddleware = require('webpack-dev-middleware');
    var webpackConf       = require('../../webpack.config');

    app.use(webpackMiddleware(webpack(webpackConf)));
}

app.use(express.static(path.resolve(__dirname, '../../public')));

app.use((req, res, next) => {
    res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
    res.locals.absoluteUrl = res.locals.baseUrl + req.originalUrl;
    return next();
});

// routes
app.get('/', (req, res) => {
    res.redirect('/search/pct/skatt');
});

app.get('/search/:unit/:query', (req, res) => {
    res.render('index', {
        title: `${req.params.query} - Referatsøk`,
        query: req.params.query
    });
});

app.get('/opensearch', (req, res) => {
    res.type('application/opensearchdescription+xml');
    res.render('opensearch');
});

app.get('/api/search', (req, res) => {
    if (req.query.query) {
        api.search(req.query)
            .then(results => res.json(results))
            .catch(errorHandler.bind(res));
    } else {
        res.status(400).json({error: "missing query param"});
    }
});

app.get('/api/speeches/:id', (req, res) => {
    api.getSpeech(req.params.id)
        .then(results => res.json(results))
        .catch(errorHandler.bind(res));
});

app.get('/api/context/:id/:start/:end', (req, res) => {
    var {id,start,end} = req.params;

    api.getContext(id, +start, +end)
        .then(d => res.json(d))
        .catch(errorHandler.bind(res));

});

module.exports = app;
