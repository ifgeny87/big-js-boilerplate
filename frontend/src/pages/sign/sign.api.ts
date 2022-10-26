import { fetchBackend } from '../../core/api/fetchBackendRoot';

export async function postLogin(username: string, password: string): Promise<any> {
	return fetchBackend
		.post('login', { username, password });
}

export async function postLogout(): Promise<any> {
	return fetchBackend
		.post('logout');
}

export async function getMyInfo(): Promise<any> {
	return await fetchBackend
		.get('users/me');
}
