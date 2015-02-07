var React              = require('react');
var div                = React.DOM.div;
var TopHits            = React.createFactory(require('./TopHits'));
var TopParties         = React.createFactory(require('./TopParties'));
var TopRepresentatives = React.createFactory(require('./TopRepresentatives'));

module.exports = React.createClass({
    render: function () {
        return div(
            {className: 'row'},
            div({className: 'col-md-4'}, TopHits()),
            div({className: 'col-md-4'}, TopParties()),
            div({className: 'col-md-4'}, TopRepresentatives())
        );
    }
});