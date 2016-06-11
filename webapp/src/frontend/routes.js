import React     from 'react';
import { Route } from 'react-router';

import App             from './components/App';
import Search          from './components/Search';
import SpeechInContext from './components/SpeechInContext';
import Lix             from './components/Lix';

export default (
    <Route path="/" component={App}>
        <Route path="search" component={Search}>
            <Route
                component={Search}
                path=":unit/:queries/:focused"
                ignoreScrollBehavior
                />
        </Route>

        <Route
            path="speeches/:transcript/:order"
            component={SpeechInContext}
            />

        <Route
            path="backstage/lix"
            component={Lix}
            />
    </Route>
);
