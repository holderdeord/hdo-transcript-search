var React = require('react');
var div = React.DOM.div;
var h3 = React.DOM.h3;

module.exports = React.createClass({
    render: function () {
        return div(null, h3(null, 'Representanter'));
    }
});