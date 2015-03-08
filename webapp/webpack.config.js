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
            { test: /\.jsx?$/,  loader: "babel-loader", exclude: /node_modules/ },
            { test: /\.less$/,  loader: "style-loader!css-loader!less-loader" },
            { test: /\.woff$/,  loader: "url-loader?limit=10000&minetype=application/font-woff" },
            { test: /\.woff2$/, loader: "url-loader?limit=10000&minetype=application/font-woff2" },
            { test: /\.ttf$/,   loader: "file-loader" },
            { test: /\.eot$/,   loader: "file-loader" },
            { test: /\.svg$/,   loader: "file-loader" },
            { test: /\.scss$/,  loader: "style!css!sass?includePaths[]=" + (path.resolve(__dirname, "./node_modules")) }
        ]
    },

    devtool: 'source-map'
};

