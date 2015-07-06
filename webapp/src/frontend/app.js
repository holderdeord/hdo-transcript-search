require('./styles/main.less');
require('./styles/chartist.scss');

import React  from 'react';
import { Router } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';
import routes from './routes';
import { Provider } from 'redux/react';
import { createStore } from 'redux';
import reducers from './reducers';

const initialState = {};
const store = createStore(reducers, initialState);

React.render(
    <Provider store={store}>
        {() => <Router history={history}>{routes}</Router>}
    </Provider>,
    document.getElementById('content')
);
