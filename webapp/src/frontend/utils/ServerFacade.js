import Promise from 'bluebird';
import reqwest from 'reqwest';

export default class ServerFacade {
    search(query, interval) {
        var path = this.searchPathFor(query, interval);
        return reqwest(path);
    }

    searchMultiple(queries, interval) {
        return Promise.map(queries, q => {
            return reqwest(this.searchPathFor(q, interval)).then((r) => {
                return {query: q, result: r};
            });
        });
    }

    speechContext(transcriptId, start, end) {
        var path = `/api/context/${transcriptId}/${start}/${end}`;
        return reqwest(path);
    }

    searchPathFor(query, interval) {
        return `/api/search?interval=${interval}&query=${query}`;
    }

}