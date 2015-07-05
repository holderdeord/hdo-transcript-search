export default class Analytics {

    static ga() {
        return window.ga || ((...args) => console.log(args)); // eslint-disable-line
    }

    static sendEvent(name, arg) {
        this.ga()('send', 'event', name, arg);
    }

    constructor(flux) {
        let searchActions = flux.getActions('search');
        let ga = this.constructor.ga();

        this.register(searchActions.summary, (r) =>
                ga('send', 'event', 'summary', r.map(e => e.query).sort().join(',')));

        this.register(searchActions.hits, (r) =>
                ga('send', 'event', 'hits', r.map(e => e.query).sort().join(',')));

        this.register(searchActions.reset, () =>
                ga('send', 'event', 'reset'));
    }
}
