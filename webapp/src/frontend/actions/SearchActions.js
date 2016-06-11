import { facade } from '../utils/ServerFacade';
import {
    SUMMARY,
    HITS,
    MORE_HITS,
    SPEECH_CONTEXT,
    RESET,
    SERVICES,
    LIX_STATS
} from '../constants/ActionTypes';

export function summary(queries, interval = 'year') {
    return dispatch =>
        facade
            .summary(queries, interval)
            .then(
                success(dispatch, SUMMARY),
                error(dispatch, SUMMARY)
            );
}

export function hits(queries) {
    return dispatch =>
        facade
            .hits(queries)
            .then(
                success(dispatch, HITS),
                error(dispatch, HITS)
            );
}

export function moreHits(query, start) {
    return dispatch =>
        facade
            .hits([query], start, 10)
            .then(
                success(dispatch, MORE_HITS),
                error(dispatch, MORE_HITS)
            );
}

export function speechContext(transcriptId, order) {
    return dispatch =>
        facade
            .speechContext(transcriptId, order - 1, order + 1)
            .then(
                success(dispatch, SPEECH_CONTEXT),
                error(dispatch, SPEECH_CONTEXT)
            );
}

export function services() {
    return dispatch =>
        facade.services().then(
            success(dispatch, SERVICES),
            error(dispatch, SERVICES),
        );
}

export function reset() {
    return { type: RESET };
}

export function lixStats() {
    return dispatch =>
        facade
            .lixStats()
            .then(
                success(dispatch, LIX_STATS),
                error(dispatch, LIX_STATS)
            );
}

function success(dispatch, type) {
    return (payload) => dispatch({ type: type, payload: payload });
}

function error(dispatch, type) {
    return (payload) => dispatch({ type: type, error: true, payload: payload });
}
