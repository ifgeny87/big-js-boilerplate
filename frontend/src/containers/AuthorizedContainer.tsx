import React from 'react';
import { useDispatch } from 'react-redux';
import { clearMeAction } from '../store/actions/SigninActions';
import { postLogout } from '../pages/sign/sign.api';

export default function AuthorizedContainer() {
	const dispatch = useDispatch();

	const logout = () => {
		postLogout()
			.finally(() => clearMeAction(dispatch));
	}

	return (
		<div>
			You are signed
			<br />
			<button onClick={logout}>Logout</button>
		</div>
	);
}
