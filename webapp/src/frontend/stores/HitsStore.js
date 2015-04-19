import { Store } from 'flummox';

export default class HitsStore extends Store {
    constructor(flux) {
        super();

        let searchActions = flux.getActions('search');

        this.register(searchActions.reset, this.handleReset);
        this.register(searchActions.hits, this.handleHits);

        this.state = {hits: null};
    }

    handleHits(response) {
        console.log('HitsStore', 'handleHits');
        this.setState({ hits: response });
    }

    handleReset() {
        console.log('HitsStore', 'handleHits');
        this.setState({hits: null});
    }

}

