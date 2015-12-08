import { SUMMARY, RESET } from '../constants/ActionTypes';

const initialState = {
    results: [],
    queries: [],
    joinedQuery: ''
};

export default function(state = initialState, action) {
    switch (action.type) {
    case SUMMARY:
        let queries = action.payload.map(r => r.query);

        return {
            results: action.payload,
            queries: queries,
            joinedQuery: queries.join(', ')
        };
    case RESET:
        return initialState;
    default:
        return state;
    }
}
