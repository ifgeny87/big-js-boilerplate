export const getCookie = (name: string): string | undefined => {
	const matches = document.cookie.match(new RegExp(
		'(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + '=([^;]*)',
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

export const setCookie = (name: string, value: string, options: any = {}) => {
	options = {
		path: '/',
		...options,
	};

	if (options.expires && options.expires.toUTCString) {
		options.expires = options.expires.toUTCString();
	}

	let updatedCookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

	Object.keys(options).forEach(optionKey => {
		updatedCookie += `;${optionKey}`;
		const optionValue = options[optionKey];
		if (optionValue !== true) {
			updatedCookie += `=${optionValue}`;
		}
	});

	document.cookie = updatedCookie;
};

const HEADER_WEB_AUTH_TOKEN = 'Authorization';

export const getAuthorizedCookie = (): string | undefined => getCookie(HEADER_WEB_AUTH_TOKEN);

export const deleteAuthorizedCookie = () => {
	setCookie(HEADER_WEB_AUTH_TOKEN, '', { 'max-age': -1 });
};
