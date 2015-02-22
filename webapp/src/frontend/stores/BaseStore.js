import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import EventEmitter        from 'events';

var CHANGE_EVENT = 'change';

export default class BaseStore extends EventEmitter {
    constructor() {
        super();
        this.dispatchToken = SearchAppDispatcher.register(this.handleAction.bind(this));
    }

    emitChange() {
        this.emit(CHANGE_EVENT);
    }

    addChangeListener(callback) {
        this.on(CHANGE_EVENT, callback);
    }

    removeChangeListener(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
}
