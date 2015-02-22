require("./styles/main.less");
require('./styles/chartist.scss');

import React               from 'react';
import SearchApp           from './components/SearchApp';
import ActionTypes         from './constants/ActionTypes';
import SearchAppDispatcher from './dispatcher/SearchAppDispatcher';
import TranscriptSearchAPI from './utils/TranscriptSearchAPI';

// really not sure if this belongs here
SearchAppDispatcher.register(function (payload) {
    console.log(payload);

    switch (payload.action.type) {
        case ActionTypes.SEARCH:
            TranscriptSearchAPI.search(payload.action.query, payload.action.interval);
            break;
        case ActionTypes.SEARCH_MULTI:
            TranscriptSearchAPI.searchMultiple(payload.action.queries, payload.action.interval);
            break;
        case ActionTypes.SPEECH_CONTEXT:
            TranscriptSearchAPI.speechContext(payload.action.transcript, payload.action.start, payload.action.end);
            break;
        default:
        // nothing
    }
});


React.render(
    <SearchApp />,
    document.getElementById('content')
);
