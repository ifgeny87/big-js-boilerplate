import { CLEAR_ME_CONFIG, FETCH_ME_CONFIG, MePayload } from '../actions/SigninActions';
import { createReducer } from '@reduxjs/toolkit';

const initialState: MePayload = {};

export const meReducer = createReducer(initialState,
	builder => builder
		.addCase(FETCH_ME_CONFIG, (state, action) => {
			return { ...state, ...action.payload };
		})
		.addCase(CLEAR_ME_CONFIG, () => {
			return {};
		}),
);
