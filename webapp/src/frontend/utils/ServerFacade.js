import Promise from 'bluebird';
import reqwest from 'reqwest';

export default class ServerFacade {

    summary(queries, interval) {
        return Promise.map(queries, q => {
            return reqwest(this._summaryPathFor(q, interval)).then((r) => {
                return {query: q, result: r};
            });
        });
    }

    hits(query) {
        return reqwest(`/api/search/hits?query=${query}`);
    }

    speechContext(transcriptId, start, end) {
        var path = `/api/context/${transcriptId}/${start}/${end}`;
        return reqwest(path);
    }

    _summaryPathFor(query, interval) {
        return `/api/search/summary?interval=${interval}&query=${query}`;
    }

}