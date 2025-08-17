import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import Reducer from '../reducers/RootReducer';

const initialState = {};

const store = createStore(
    Reducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunk))
);

export default store;
