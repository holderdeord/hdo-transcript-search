import {
    SERVICES
} from '../constants/ActionTypes';

export default function services(state = [], action) {
    switch (action.type) {
    case SERVICES:
        state = action.payload;
        break;
    default:
        // do nothing
    }

    return state;
}
