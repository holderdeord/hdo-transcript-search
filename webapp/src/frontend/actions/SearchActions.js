import { Actions }  from 'flummox';
import ServerFacade from '../utils/ServerFacade';

export default class SearchActions extends Actions {
    constructor() {
        super();
        this.server = new ServerFacade();
    }

    summary(queries, interval) {
        return this.server.summary(queries, interval);
    }

    hits(queries) {
        return this.server.hits(queries);
    }

    moreHits(query, start) {
        return this.server.hits([query], start);
    }

    reset() {
        return null;
    }
}