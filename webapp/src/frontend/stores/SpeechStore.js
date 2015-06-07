import { Store } from 'flummox';

export default class SpeechStore extends Store {
    constructor(flux) {
        super();

        let searchActions = flux.getActions('search');

        this.register(searchActions.speechContext, this.handleContext);

        this.state = {speeches: null};
    }

    handleContext(speeches) {
        this.setState({speeches: speeches});
    }

}

