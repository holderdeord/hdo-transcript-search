import './styles/main.less';
import './styles/chartist.scss';
import 'font-awesome/css/font-awesome.css';

import React  from 'react';
import { Router } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';
import routes from './routes';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

const initialState = {};
const reducer = combineReducers(reducers);
const createThunkStore = applyMiddleware(thunk)(createStore);
const store = createThunkStore(reducer, initialState);

React.render(
    <Provider store={store}>
        {() => <Router history={history}>{routes}</Router>}
    </Provider>,
    document.getElementById('content')
);
