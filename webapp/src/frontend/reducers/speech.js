import { SPEECH_CONTEXT, RESET } from '../constants/ActionTypes';

const initialState = {
    speeches: []
};

export default function(state = initialState, action) {
    switch (action.type) {
    case SPEECH_CONTEXT:
        return { speeches: action.payload };
    case RESET:
        return initialState;
    default:
        return state;
    }
}
