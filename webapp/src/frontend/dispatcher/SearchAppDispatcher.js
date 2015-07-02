import Flux           from 'flux';
import PayloadSources from '../constants/PayloadSources';

class SearchAppDispatcher extends Flux.Dispatcher {
    handleServerAction(action) {
        var payload = {
            source: PayloadSources.SERVER_ACTION,
            action: action
        };

        this.dispatch(payload);
    }

    handleViewAction(action) {
        var payload = {
            source: PayloadSources.VIEW_ACTION,
            action: action
        };

        this.dispatch(payload);
    }
}

export default new SearchAppDispatcher();
