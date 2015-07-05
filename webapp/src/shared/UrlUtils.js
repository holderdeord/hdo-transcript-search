export default class UrlUtils {
    static speechPathFor(speech) {
        return `/speeches/${speech.transcript}/${speech.order}`;
    }
}
