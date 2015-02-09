var React               = require('react');
var moment              = require('moment');
var SearchAppDispatcher = require('../dispatcher/SearchAppDispatcher');
var ActionTypes         = require('../constants/ActionTypes');

var {div,h3,ol,li,span,a} = React.DOM;
moment.locale('nb');

class TopHits extends React.Component {

    constructor(props) {
        super(props);
        this.state = { hits: [], totalCount: 0, hitCount: 0};
    }

    componentDidMount() {
        this.dispatchToken = SearchAppDispatcher.register(payload => {
            if (payload.action.type === ActionTypes.SEARCH_RESULT) {
                this.setState(payload.action.result);
            } else if (payload.action.type === ActionTypes.RESET) {
                this.setState({ hits: [], totalCount: 0, hitCount: 0});
            }
        });
    }

    componentWillUnmount() {
        SearchAppDispatcher.unregister(this.dispatchToken);
    }

    render() {
        var elements     = this.state.hits.map(this.renderHit);
        var hitCountText = `${this.state.hitCount} av ${this.state.totalCount} innlegg`;

        return div(null,
                   span({className: 'pull-right text-muted'}, hitCountText),
                   h3(null, 'Treff'),
                   ol(null, elements)
                  );
    }

    renderHit(hit) {
        var source    = hit._source;
        var timestamp = moment(source.time).format('LLL');
        var person    = `${source.name} (${source.party || source.title})`;
        var href      = `/api/speeches/${hit._id}`; // FIXME: don't hardcode paths

        return li({key: hit._id, className: 'hit'},
                  div({className: 'pull-right'},
                      a({href: href, style: {color: 'inherit'}}, timestamp)),
                  div(null, person),
                  div({className: 'text-muted', dangerouslySetInnerHTML: {__html: hit.highlight.text}})
                 );
    }
}

module.exports = TopHits;
