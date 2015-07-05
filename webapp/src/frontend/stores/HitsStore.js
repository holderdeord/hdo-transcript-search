export default class HitsStore {
    constructor(flux) {
        super();

        let searchActions = flux.getActions('search');

        this.register(searchActions.reset, this.handleReset);
        this.register(searchActions.hits, this.handleHits);
        this.register(searchActions.moreHits, this.handleMoreHits);

        this.state = {hits: null};
    }

    handleHits(responses) {
        this.setState({ hits: responses });
    }

    handleMoreHits(responses) {
        let response = responses[0];
        let hits = this.state.hits;

        hits.forEach(function(hit) {
            if (hit.query === response.query) {
                hit.hits = hit.hits.concat(response.hits);
            }
        });

        this.setState({hits: hits});
    }

    handleReset() {
        this.setState({hits: null});
    }

}

