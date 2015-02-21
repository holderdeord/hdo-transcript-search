import React from 'react';
require("./styles/main.less");
require('./styles/chartist.scss');

var SearchApp = require('./components/SearchApp');

React.render(
    <SearchApp />,
    document.getElementById('content')
);
