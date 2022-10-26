import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.scss';
import AuthorizedContainer from './containers/AuthorizedContainer';
import UnauthorizedContainer from './containers/UnauthorizedContainer';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { fetchMeAction } from './store/actions/SigninActions';

export default function App() {
	const [isCheckAuth, setCheckAuth] = useState(true);
	const dispatch = useDispatch();

	useEffect(() => {
		fetchMeAction(dispatch)
			.finally(() => {
				setCheckAuth(false);
			});
	}, []);

	const me = useSelector(({ me }: any) => me);

	if (!me || isCheckAuth) {
		return <LoadingSpinner />;
	}

	return me.username
		? <AuthorizedContainer />
		: <UnauthorizedContainer />;
}
