import { Store } from 'flummox';

export default class Analytics extends Store {

      constructor(flux) {
        super();

        let searchActions = flux.getActions('search');
        let ga = window.ga || ((...args) => console.log(args));

        this.register(searchActions.searchAdd, (r) =>
                ga('send', 'event', 'search-add', r.query));

        this.register(searchActions.searchMulti, (r) =>
                ga('send', 'event', 'search-multi', r.map(e => e.query).sort().join(',')));

        this.register(searchActions.reset, () =>
                ga('send', 'event', 'reset'));
      }
}