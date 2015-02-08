var express = require('express');
var logger  = require('morgan');
var api     = require('./api');
var config  = require('../../config');
var app     = express();
var path    = require('path');

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
app.get('/api/search', function (req, res) {
    if (req.query.query) {
        api.search(req.query).then(function (results) { res.json(results); });
    } else {
        res.status(400).json({error: "missing query param"});
    }
});

module.exports = app;