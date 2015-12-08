import {
    SUMMARY,
    HITS,
    SPEECH_CONTEXT,
    RESET
} from '../constants/ActionTypes';

export const ga = window.ga || ((...args) => console.log(args)); // eslint-disable-line

export default function analytics(state = null, action) {
    switch (action.type) {
    case SUMMARY:
        ga('send', 'event', 'summary', action.payload.map(r => r.query).sort().join(',').toLowerCase());
        break;
    case HITS:
        ga('send', 'event', 'hits', action.payload.map(r => r.query).sort().join(',').toLowerCase());
        break;
    case SPEECH_CONTEXT:
        ga('send', 'event', 'speech', action.payload.map(r => r.id).join(','));
        break;
    case RESET:
        ga('send', 'event', 'reset');
        break;
    default:
        // do nothing
    }

    return state;
}
