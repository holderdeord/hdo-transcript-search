var React               = require('react');
var SearchApp           = React.createFactory(require('./components/SearchApp'));

React.render(
    SearchApp(),
    document.getElementById('content')
);