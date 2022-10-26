import { LoggerService } from '@nestjs/common';
import * as Winston from 'winston';
import * as chalk from 'chalk';
import { isProd } from '../config/env';
import { parseError } from '../utils/errors';

// Levels:
// error: 0
// warn: 1
// info: 2 ==> TEST level
// http: 3 ==> PROD level
// verbose: 4
// debug: 5 ==> DEV level
// silly: 6

const logLevel = process.env.LOG_LEVEL || (isProd ? 'http' : 'debug');

// Проверяем уровень лога
const availableLogLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
if (!availableLogLevels.includes(logLevel || '')) {
	console.error(`[Ошибка логгера] значение уровня лога может принимать одно значение из ${availableLogLevels}. Для указания уровня лога используется env LOG_LEVEL или переменная конфига logLevel.\nProcess will exit.`);
	process.exit(1);
}

// имя лог файла
const logFileName = process.env.LOGGER_FILE_NAME;
if (isProd && !logFileName?.length) {
	console.error(`[Ошибка логгера] env LOGGER_FILE_NAME должна указывать на имя файла лога и иметь длину от 5 до 50 символов.\nProcess will exit.`);
	process.exit(1);
}

let lastLogDate: Date;

// doc: https://github.com/winstonjs/winston
const myConsoleFormat = Winston.format.printf((error): string => {
	const { level, label, ...errorParts } = error;
	const date = new Date();
	const timestamp = date.toISOString();
	const delta = lastLogDate ? date.getTime() - lastLogDate.getTime() : 0;
	lastLogDate = date;
	const deltaStr = `+${delta > 9_000
		? `${Math.floor(delta / 100) / 10}s`
		: delta > 99_000
			? `${Math.floor(delta / 1000)}s`
			: delta > 600_000
				? `${Math.floor(delta / 60000) / 10}m`
				: `${delta}ms`}`.padStart(6);
	let startLine: string;
	if (level === 'debug') {
		startLine = `${timestamp} ${deltaStr} ${chalk.bgWhite.gray(level)} [${chalk.magenta(label)}]`;
	} else {
		const color = level === 'error' ? chalk.bgRed.yellow
			: level === 'warn' ? chalk.red
				: level === 'info' ? chalk.bgCyan.black
					: level === 'http' ? chalk.bgYellow.black
						: chalk.bgWhiteBright.black;
		startLine = `${timestamp} ${deltaStr} ${color(level)} [${chalk.magenta(label)}]`;
	}
	const text = startLine + ' ' + parseError(errorParts);
	return (level === 'debug' ? chalk.gray(text) : text);
});

export class AppLogger implements LoggerService
{
	private readonly loggers = new Map<string, Winston.Logger>();

	constructor(private readonly alternativeInstance: string = '') {}

	private initLogger(instanceName: string): void {
		const options: Winston.LoggerOptions = {
			level: logLevel,
			transports: [],
		};
		const logger = Winston.createLogger(options);

		// пишем логи в консоль
		logger.add(new Winston.transports.Console({
			format: Winston.format.combine(
				Winston.format.label({ label: instanceName || this.alternativeInstance }),
				myConsoleFormat,
			),
		}));

		// если указан лог файл, то будем писать логи в него
		if (logFileName) {
			logger.add(new Winston.transports.File({
				format: Winston.format.combine(
					Winston.format.label({ label: instanceName }),
					myConsoleFormat,
				),
				filename: logFileName,
				maxFiles: 25,
			}));
		}

		this.loggers.set(instanceName, logger);
	}

	private getLogger(instanceName: string): Winston.Logger {
		if (!this.loggers.has(instanceName)) {
			this.initLogger(instanceName);
		}
		return this.loggers.get(instanceName)!;
	}

	log(message: any, instanceName?: string, ...optionalParams: any[]): any {
		const instanceName_ = instanceName || this.alternativeInstance;
		const logger = this.getLogger(instanceName_);
		logger.info(message, optionalParams);
	}

	error = async (error: Error, instanceName?: string, ...optionalParams: any[]): Promise<void> => {
		const instanceName_ = instanceName || this.alternativeInstance;
		const logger = this.getLogger(instanceName_);
		if (error instanceof Error) {
			logger.error('', error, optionalParams);
		} else {
			logger.error(error, optionalParams);
		}
	};

	warn = async (message: any, instanceName?: string, ...optionalParams: any[]): Promise<void> => {
		const instanceName_ = instanceName || this.alternativeInstance;
		const logger = this.getLogger(instanceName_);
		logger.warn(message, optionalParams);
	};

	verbose(message: any, instanceName?: string, ...optionalParams: any[]): any {
		const instanceName_ = instanceName || this.alternativeInstance;
		const logger = this.getLogger(instanceName_);
		logger.log('verbose', message, optionalParams);
	}

	debug(message: any, instanceName?: string, ...optionalParams: any[]): any {
		const instanceName_ = instanceName || this.alternativeInstance;
		const logger = this.getLogger(instanceName_);
		logger.debug(message, optionalParams);
	}
}
