var path = require('path');
var fs = require('fs');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var precss = require('precss');

module.exports = {
    entry: path.join(__dirname, 'src/frontend/app'),
    cache: true,

    output: {
        path: path.join(__dirname, '/public/'),
        filename: 'bundle.[hash].js'
    },

    module: {
        loaders: [
            { test: /\.css$/,   loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
            { test: /\.jsx?$/,  loader: "babel-loader", exclude: /node_modules/ },
            { test: /\.less$/,  loader: "style-loader!css-loader!postcss-loader!less-loader" },
            { test: /\.(ttf|eot|otf|svg|woff|woff2)(\?.+)?$/, loader: "url-loader?limit=10000" },
            { test: /\.scss$/,  loader: "style!css!sass?includePaths[]=" + (path.resolve(__dirname, "./node_modules")) }
        ]
    },

    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /nb$/),
        new ExtractTextPlugin('bundle.[hash].css'),
        function() {
            this.plugin('done', function(stats) {
                fs.writeFile(path.resolve(__dirname, './public/hash'), stats.hash);
            });
        }
    ],

    postcss: function() {
        return [autoprefixer, precss];
    },

    devtool: 'source-map'
};

