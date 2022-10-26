import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import appReducers from './reducers';

// @ts-ignore
const composeEnhancer = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

export function initStore() {
	const store = createStore(
		combineReducers({ ...appReducers }),
		{},
		composeEnhancer(applyMiddleware(thunk)),
	);
	// @ts-ignore
	if (module.hot) {
		// @ts-ignore
		module.hot.accept('./reducers', () => {
			const nextRootReducer = require('./reducers');
			store.replaceReducer(() => nextRootReducer);
		});
	}
	return store;
}

export const appStore = initStore();
