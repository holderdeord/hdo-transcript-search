import { Store } from 'flummox';

export default class Analytics extends Store {

      constructor(flux) {
        super();

        let searchActions = flux.getActions('search');
        let ga = window.ga || ((...args) => console.log(args));

        this.register(searchActions.summary, (r) =>
                ga('send', 'event', 'summary', r.map(e => e.query).sort().join(',')));

        this.register(searchActions.hits, (r) =>
                ga('send', 'event', 'hits', r.query));

        this.register(searchActions.reset, () =>
                ga('send', 'event', 'reset'));
        }
}