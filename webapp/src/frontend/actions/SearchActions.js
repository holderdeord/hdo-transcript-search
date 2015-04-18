import { Actions }  from 'flummox';
import ServerFacade from '../utils/ServerFacade';

export default class SearchActions extends Actions {
    constructor() {
        super();
        this.server = new ServerFacade();
    }

    searchAdd(query, interval) {
        return this.server.summary(query, interval).then(result => {
            return {query: query, result: result};
        });
    }

    searchMulti(queries, interval) {
        return this.server.summaryMultiple(queries, interval);
    }

    reset() {
        return null;
    }
}