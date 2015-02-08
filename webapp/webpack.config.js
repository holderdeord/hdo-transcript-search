var path    = require('path');
var webpack = require('webpack');

module.exports = {
    cache: true,
    entry: path.join(__dirname, 'src/frontend/app'),

    output: {
        path: path.join(__dirname, '/public/'),
        filename: 'bundle.js'
    }
};