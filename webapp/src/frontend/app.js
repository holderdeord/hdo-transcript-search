var React      = require('react');
var div        = React.DOM.div;
var hr         = React.DOM.hr;
var SearchApp  = React.createFactory(require('./components/SearchApp'));

require('./store.js');

React.render(
    SearchApp(),
    document.getElementById('content')
);