var React               = require('react');
var SearchAppDispatcher = require('../dispatcher/SearchAppDispatcher');
var ActionTypes         = require('../constants/ActionTypes');

var div                 = React.DOM.div;
var h3                  = React.DOM.h3;
var ol                  = React.DOM.ol;
var li                  = React.DOM.li;

module.exports = React.createClass({
    getInitialState: function () {
        return { counts: {}};
    },

    componentDidMount: function () {
        this.dispatchToken = SearchAppDispatcher.register(function (payload) {
            if (payload.action.type === ActionTypes.SEARCH_RESULT) {
                this.setState({counts: payload.action.result.peopleCounts});
            } else if (payload.action.type === ActionTypes.RESET) {
                this.setState(this.getInitialState());
            }
        }.bind(this));
    },

    componentWillUnmount: function () {
        SearchAppDispatcher.unregister(this.dispatchToken);
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