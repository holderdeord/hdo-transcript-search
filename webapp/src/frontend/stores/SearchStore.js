import { Store } from 'flummox';

export default class SearchStore extends Store {
    constructor(flux) {
        super();

        let searchActions = flux.getActions('search');

        this.register(searchActions.searchAdd, this.handleSearchAdd);
        this.register(searchActions.searchMulti, this.handleSearchMulti);
        this.register(searchActions.reset, this.handleReset);

        this.state = {
            results: []
        };
    }

    handleSearchAdd(result) {
        this.setState({
            results: this.state.results.concat([result])
        });
    }

    // TODO: "multi" is really a sort of "replace"
    handleSearchMulti(results) {
        this.setState({
            results: results
        });
    }

    handleReset() {
        this.setState({results: []});
    }

    getResults() {
        return this.state.results;
    }

    getLastResult() {
        return this.state.results.slice(-1)[0];
    }

    getQueries() {
        return this.state.results.map(e => e.query);
    }

    getJoinedQuery() {
        return this.getQueries().join(', ');
    }

    hasQuery(q) {
        return this.getQueries().indexOf(q) !== -1;
    }

    eachResult(callback) {
        this.state.results.forEach((r) => callback(r.query, r.result));
    }

}

