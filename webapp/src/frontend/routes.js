import React   from 'react';
import {Route} from 'react-router';

import App    from './components/App';
import Search from './components/Search';
import Speech from './components/Speech';

export default (
    <Route name="app" path="/" handler={App}>
        <Route name="blank" path="/search" handler={Search}>
            <Route
                name="search"
                handler={Search}
                path="/search/:unit/:queries/:focused"
                ignoreScrollBehavior
                />
        </Route>

        <Route name="speech" path="/speeches/:transcript/:order" handler={Speech} />
    </Route>
);
