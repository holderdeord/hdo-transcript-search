var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: path.join(__dirname, 'src/frontend/app'),
    cache: true,

    output: {
        path: path.join(__dirname, '/public/'),
        filename: 'bundle.js'
    },

    module: {
        loaders: [
            { test: /\.css$/,   loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
            { test: /\.jsx?$/,  loader: "babel-loader", exclude: /node_modules/ },
            { test: /\.less$/,  loader: "style-loader!css-loader!less-loader" },
            { test: /\.(ttf|eot|otf|svg|woff|woff2)(\?.+)?$/, loader: "url-loader?limit=10000" },
            { test: /\.scss$/,  loader: "style!css!sass?includePaths[]=" + (path.resolve(__dirname, "./node_modules")) }
        ]
    },

    plugins: [
        new ExtractTextPlugin('bundle.css')
    ],

    devtool: 'source-map'
};

