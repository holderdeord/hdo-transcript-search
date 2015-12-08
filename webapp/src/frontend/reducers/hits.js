import { HITS, MORE_HITS, RESET } from '../constants/ActionTypes';

const initialState = {
    hits: null
};

export default function(state = initialState, action) {
    switch (action.type) {
    case HITS:
        return { hits: action.payload };
    case MORE_HITS:
        let response = action.payload[0];

        let hits = state.hits.map(hit => {
            if (hit.query === response.query) {
                return {
                    ...hit,
                    hits: [...hit.hits, ...response.hits]
                };
            } else {
                return hit;
            }
        });

        return { hits: hits };
    case RESET:
        return initialState;
    default:
        return state;
    }
}
