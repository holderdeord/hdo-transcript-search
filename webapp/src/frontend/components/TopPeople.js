var React               = require('react');
var SearchAppDispatcher = require('../dispatcher/SearchAppDispatcher');
var ActionTypes         = require('../constants/ActionTypes');

var {div,h3,ol,li} = React.DOM;

class TopPeople extends React.Component {

    constructor(props) {
        super(props);
        this.state = {counts: this.props.initialCounts};
    }

    componentDidMount() {
        this.dispatchToken = SearchAppDispatcher.register(payload => {
            if (payload.action.type === ActionTypes.SEARCH_RESULT) {
                this.setState({counts: payload.action.result.peopleCounts});
            } else if (payload.action.type === ActionTypes.RESET) {
                this.setState({counts: this.props.initialCounts});
            }
        });
    }

    componentWillUnmount() {
        SearchAppDispatcher.unregister(this.dispatchToken);
    }

    render() {
        var counts = this.state.counts;
        var elements = Object.keys(counts).map(k => {
            return li({key: k}, `${k}: ${counts[k]}`);
        });

        return div(
            null,
            h3(null, 'Personer'),
            ol(null, elements)
        );
    }
}

TopPeople.defaultProps = { initialCounts: {} };

module.exports = TopPeople;
