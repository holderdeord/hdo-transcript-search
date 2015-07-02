import { Actions }  from 'flummox';
import ServerFacade from '../utils/ServerFacade';
import titleSuffix  from '../constants/titleSuffix';

export default class SearchActions extends Actions {
    constructor() {
        super();
        this.server = new ServerFacade();
    }

    summary(queries, interval = 'year') {
        return this.server.summary(queries, interval);
    }

    hits(queries) {
        return this.server.hits(queries);
    }

    moreHits(query, start) {
        return this.server.hits([query], start, 10);
    }

    speechContext(transcript, order) {
        return this.server.speechContext(transcript, order - 1, order + 1);
    }

    reset() {
        document.title = titleSuffix;
        return null;
    }
}
