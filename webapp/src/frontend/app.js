var React      = require('react');
var SearchApp  = React.createFactory(require('./components/SearchApp'));

require('./store.js');

React.render(
    SearchApp(),
    document.getElementById('content')
);