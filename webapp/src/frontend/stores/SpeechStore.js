export default class SpeechStore {
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

