var React               = require('react');
var moment              = require('moment');
var SearchAppDispatcher = require('../dispatcher/SearchAppDispatcher');
var ActionTypes         = require('../constants/ActionTypes');

var div  = React.DOM.div;
var h3   = React.DOM.h3;
var ol   = React.DOM.ol;
var li   = React.DOM.li;
var span = React.DOM.span;
var a    = React.DOM.a;

moment.locale('nb');

module.exports = React.createClass({
    getInitialState: function () {
        return { hits: [], totalCount: 0, hitCount: 0};
    },

    componentDidMount: function () {
        this.dispatchToken = SearchAppDispatcher.register(function (payload) {
            if (payload.action.type === ActionTypes.SEARCH_RESULT) {
                this.setState(payload.action.result);
            } else if (payload.action.type === ActionTypes.RESET) {
                this.setState(this.getInitialState());
            }
        }.bind(this));
    },

    componentWillUnmount: function () {
        SearchAppDispatcher.unregister(this.dispatchToken);
    },

    render: function () {
        var elements     = this.state.hits.map(this.renderHit);
        var hitCountText = this.state.hitCount + ' av ' + this.state.totalCount + ' innlegg';

        return div(null,
                   span({className: 'pull-right text-muted'}, hitCountText),
                   h3(null, 'Treff'),
                   ol(null, elements)
                  );
    },

    renderHit: function (hit) {
        var source    = hit._source;
        var timestamp = moment(source.time).format('LLL');
        var person    = source.name + ' (' + (source.party || source.title) + ')';

        return li({key: hit._id, className: 'hit'},
                  div({className: 'pull-right'},
                      // FIXME: don't hardcode paths
                      a({href: '/api/speeches/' + hit._id, style: {color: 'inherit'}}, timestamp)),
                  div(null, person),
                  div({className: 'text-muted', dangerouslySetInnerHTML: {__html: hit.highlight.text}})
                 );
    }
});