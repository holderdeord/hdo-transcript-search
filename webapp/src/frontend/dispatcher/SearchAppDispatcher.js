var Dispatcher     = require('flux').Dispatcher;
var PayloadSources = require('../constants/PayloadSources');

class SearchAppDispatcher extends Dispatcher {
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

module.exports = new SearchAppDispatcher();
