import { Store } from 'flummox';

export default class SummaryStore extends Store {
    constructor(flux) {
        super();

        let searchActions = flux.getActions('search');

        this.register(searchActions.summary, this.handleSummary);
        this.register(searchActions.reset, this.handleReset);

        this.state = this.stateFrom([]);
    }

    handleSummary(results) {
        console.log('SummaryStore', 'handleSummary');
        this.setState(this.stateFrom(results));
    }

    stateFrom(results) {
        let queries = results.map(e => e.query);

        return {
            results: results,
            queries: queries,
            joinedQuery: queries.join(', ')
        };
    }

    handleReset() {
        console.log('SummaryStore', 'handleReset');
        this.setState({results: [], queries: [], joinedQuery: ''});
    }

}

