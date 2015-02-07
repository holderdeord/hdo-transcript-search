var React       = require('react');
var div         = React.DOM.div;
var hr          = React.DOM.hr;
var SearchForm  = React.createFactory(require('./SearchForm'));
var Timeline    = React.createFactory(require('./Timeline'));
var ResultStats = React.createFactory(require('./ResultStats'));

module.exports = React.createClass({
    render: function () {
        return div({},
                   SearchForm(),
                   hr(),
                   Timeline(),
                   hr(),
                   ResultStats()
                  );
    }
});