import { EnvNames } from '../const/env.names';

export const isDev = process.env.NODE_ENV === EnvNames.DEVELOPMENT;

export const isTest = process.env.NODE_ENV === EnvNames.TEST;

export const isProd = process.env.NODE_ENV === EnvNames.PRODUCTION;

export const stageName = process.env.STAGE_NAME;

// checking
if (!isDev && !isTest && !isProd) {
	console.error(`Переменная среды NODE_ENV "${process.env.NODE_ENV}" указана с ошибкой.`);
	process.exit(1);
}

if (!stageName) {
	console.error(`Переменная среды STAGE_NAME должна быть указана.`);
	process.exit(1);
}
