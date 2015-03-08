import { Actions }  from 'flummox';
import ServerFacade from '../utils/ServerFacade';

export default class SearchActions extends Actions {
    constructor() {
        super();
        this.server = new ServerFacade();
    }

    searchAdd(query, interval) {
        return this.server.search(query, interval).then(result => {
            return {query: query, result: result};
        });
    }

    searchMulti(queries, interval) {
        return this.server.searchMultiple(queries, interval);
    }

    reset() {
        return null;
    }
}