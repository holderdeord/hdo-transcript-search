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

    hits(query) {
        return this.server.hits(query);
    }

    reset() {
        return null;
    }
}