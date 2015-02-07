var React      = require('react');
var div        = React.DOM.div;
var hr         = React.DOM.hr;
var SearchForm = React.createFactory(require('./SearchForm'));
var Timeline   = React.createFactory(require('./Timeline'));

module.exports = React.createClass({
    render: function () {
        return div({},
                   SearchForm(),
                   hr(),
                   Timeline()
                  );
    }
});