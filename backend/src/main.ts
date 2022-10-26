import 'source-map-support/register';
import { NestFactory } from '@nestjs/core';
import * as CookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './core/filters/all-exception.filter';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { isTest } from './core/config/env';
import { AppLogger } from './core/log/AppLogger';
import MigrationApplier from './core/database/MigrationApplier';
import { ValidateInputPipe } from './core/pipes/validate-input.pipe';

const logger = new AppLogger('main');

// отлов неперехваченных ошибок, например, из таймеров
process.on('uncaughtException', (err: Error & { isOperational: true }) => {
	logger.error(err, 'uncaughtException');
	if (!err.isOperational) {
		process.exit(1);
	}
});

// отлов ошибок Promise на случай Unhandled rejection
process.on('unhandledRejection', (err: Error & { isOperational: true }) => {
	logger.error(err, 'unhandledRejection');
	if (!err.isOperational) {
		process.exit(1);
	}
});

async function bootstrap() {
	// сначала выполняем миграции
	const migrationApplier = new MigrationApplier();
	await migrationApplier.migrateVersionFiles();
	if (isTest) {
		await migrationApplier.migrateTestFiles();
	}
	await migrationApplier.close();
	// создаем и запускаем новое Nest приложение
	const app = await NestFactory.create(AppModule, { logger });
	app.useGlobalFilters(
		// сначала глобальный фильтр ошибок
		new AllExceptionFilter(),
		// потом кастомные
		new HttpExceptionFilter(),
	);
	app.enableCors();
	app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidateInputPipe());
	app.use(CookieParser());
	await app.listen(process.env.PORT || 3000);
}

bootstrap();
