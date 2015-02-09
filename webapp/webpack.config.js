var path = require('path');

module.exports = {
    entry: path.join(__dirname, 'src/frontend/app'),

    output: {
        path: path.join(__dirname, '/public/'),
        filename: 'bundle.js'
    },

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "6to5-loader"}
        ]
    }
};

