export default class UrlUtils {
    static speechPathFor(speech) {
        return `/speeches/${speech.transcript}/${speech.order}`;
    }

    static rssPathForQuery(query) {
        return `/feed/?query=${encodeURIComponent(query)}`;
    }

    static csvPathForQuery(query) {
        return `/api/export?query=${encodeURIComponent(query)}&format=csv&sort=time.desc`;
    }
}
