import React     from 'react';
import {Route}   from 'react-router';
import SearchApp from './components/SearchApp';

export default (
    <Route name="blank" path="/" handler={SearchApp}>
        <Route
            name="search"
            handler={SearchApp}
            path="/search/:unit/:queries/:focused"
            ignoreScrollBehavior
            />
    </Route>
);
