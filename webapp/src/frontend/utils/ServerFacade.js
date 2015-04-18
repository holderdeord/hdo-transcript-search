import Promise from 'bluebird';
import reqwest from 'reqwest';

export default class ServerFacade {
    summary(query, interval) {
        var path = this.summaryPathFor(query, interval);
        return reqwest(path);
    }

    summaryMultiple(queries, interval) {
        return Promise.map(queries, q => {
            return reqwest(this.summaryPathFor(q, interval)).then((r) => {
                return {query: q, result: r};
            });
        });
    }

    speechContext(transcriptId, start, end) {
        var path = `/api/context/${transcriptId}/${start}/${end}`;
        return reqwest(path);
    }

    summaryPathFor(query, interval) {
        return `/api/search/summary?interval=${interval}&query=${query}`;
    }

}