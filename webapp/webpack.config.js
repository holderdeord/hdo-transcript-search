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
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            { test: /\.less$/, loader: "style-loader!css-loader!less-loader" }
        ]
    },

    devtool: 'source-map'
};

