import { createAction } from '@reduxjs/toolkit';
import { getMyInfo } from '../../pages/sign/sign.api';

export interface MePayload
{
	firstName?: string,
	latName?: string,
	username?: string,
}

export const FETCH_ME_CONFIG = createAction<MePayload>('FETCH_ME_CONFIG');

export const fetchMeAction = async (dispatch: any): Promise<void> => {
	return await getMyInfo()
		.then(({ data }) => {
			dispatch(FETCH_ME_CONFIG(data));
		});
}

export const CLEAR_ME_CONFIG = createAction('CLEAR_ME_CONFIG');

export const clearMeAction = (dispatch: any): void => {
	dispatch(CLEAR_ME_CONFIG());
}
