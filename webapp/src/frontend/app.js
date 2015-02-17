import React from 'react';
require("../../public/css/main.less");

var SearchApp = React.createFactory(require('./components/SearchApp'));

React.render(
    SearchApp(),
    document.getElementById('content')
);
