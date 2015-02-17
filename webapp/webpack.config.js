var path = require('path');

module.exports = {
    entry: path.join(__dirname, 'src/frontend/app'),
    cache: true,

    output: {
        path: path.join(__dirname, '/public/'),
        filename: 'bundle.js'
    },

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },

    devtool: 'source-map'
};

