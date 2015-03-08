require("./styles/main.less");
require('./styles/chartist.scss');

import React               from 'react';
import SearchApp           from './components/SearchApp';
import ActionTypes         from './constants/ActionTypes';
import PayloadSources      from './constants/PayloadSources';
import SearchAppDispatcher from './dispatcher/SearchAppDispatcher';
import TranscriptSearchAPI from './utils/TranscriptSearchAPI';

// really not sure if this belongs here
SearchAppDispatcher.register(payload => {
    // console.log(payload);

    switch (payload.action.type) {
        case ActionTypes.SEARCH_ADD:
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

if (typeof ga !== 'undefined') {
    SearchAppDispatcher.register(payload => {
        if (payload.source === PayloadSources.VIEW_ACTION) {
            switch (payload.action.type) {
                case ActionTypes.SEARCH_ADD:
                    ga('send', 'event', payload.source, payload.action.type, payload.action.query);
                    break;
                case ActionTypes.SEARCH_MULTI:
                    ga('send', 'event', payload.source, payload.action.type, payload.action.queries.slice(0).sort().join(','));
                    break;
                case ActionTypes.SPEECH_CONTEXT:
                    ga(
                        'send', 'event', payload.source, payload.action.type,
                        `${payload.action.transcript}.${payload.action.start}-${payload.action.end}`);
                    break;
                case ActionTypes.RESET:
                    ga(
                        'send', 'event', payload.source, payload.action.type, '');
                    break;
                default:
                // nothing
            }
        }
    });
}

React.render(
    <SearchApp />,
    document.getElementById('content')
);
