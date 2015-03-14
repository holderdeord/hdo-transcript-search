import { Store } from 'flummox';

export default class SearchStore extends Store {
    constructor(flux) {
        super();

        let searchActions = flux.getActions('search');

        this.register(searchActions.searchAdd, this.handleSearchAdd);
        this.register(searchActions.searchMulti, this.handleSearchMulti);
        this.register(searchActions.reset, this.handleReset);

        this.state = this.stateFrom([]);
    }

    handleSearchAdd(result) {
        let results = this.state.results.concat([result]);
        this.setState(this.stateFrom(results));
    }

    // TODO: "multi" is really a sort of "replace"
    handleSearchMulti(results) {
        this.setState(this.stateFrom(results));
    }

    stateFrom(results) {
        let queries = results.map(e => e.query);

        return {
            results: results,
            queries: queries,
            joinedQuery: queries.join(', '),
            lastResult: results[results.length - 1]
        };
    }

    handleReset() {
        this.setState(this.stateFrom([]));
    }

}

