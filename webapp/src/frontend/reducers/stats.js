import { LIX_STATS } from '../constants/ActionTypes';

const initialState = {
    lix: {
        scoreStats: null,
        parties: { buckets: [] }
    }
};

export default function(state = initialState, action) {
    switch (action.type) {
    case LIX_STATS:
        return { lix: action.payload };
    default:
        return state;
    }
}
