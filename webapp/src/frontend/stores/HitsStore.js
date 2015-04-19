import { Store } from 'flummox';

export default class HitsStore extends Store {
    constructor(flux) {
        super();

        let searchActions = flux.getActions('search');

        this.register(searchActions.reset, this.handleReset);
        this.register(searchActions.hits, this.handleHits);
        this.register(searchActions.moreHits, this.handleMoreHits);

        this.state = {hits: null};
    }

    handleHits(response) {
        this.setState({ hits: response });
    }

    handleMoreHits(response) {
        response.hits = this.state.hits.hits.concat(response.hits);
        this.setState({hits: response});
    }

    handleReset() {
        this.setState({hits: null});
    }

}

