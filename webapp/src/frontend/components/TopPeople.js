var React            = require('react');
var div              = React.DOM.div;
var h3               = React.DOM.h3;
var ol               = React.DOM.ol;
var li               = React.DOM.li;
var searchDispatcher = require('../dispatchers/search');

module.exports = React.createClass({
    getInitialState: function () {
        return { counts: {}};
    },

    componentDidMount: function () {
        this.dispatchToken = searchDispatcher.register(function (payload) {
            if (payload.actionType === 'searchResult') {
                this.setState({counts: payload.result.peopleCounts});
            } else if (payload.actionType === 'reset') {
                this.setState(this.getInitialState());
            }
        }.bind(this));
    },

    componentWillUnmount: function () {
        searchDispatcher.unregister(this.dispatchToken);
    },

    render: function () {
        var counts = this.state.counts;
        var elements = Object.keys(counts).map(function (k) {
            return li(null, k + ": " + counts[k]);
        });

        return div(
            null,
            h3(null, 'Personer'),
            ol(null, elements)
        );
    }
});