import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';

/**
 * Фильтр отлавливает все типы ошибок
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter
{
	catch(exception: any, host: ArgumentsHost): any {
		console.error(exception);
		const ctx = host.switchToHttp();
		const res = ctx.getResponse();
		const status = exception.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR;
		res
			.status(status)
			.json({
				time: new Date().toISOString(),
				error: exception.message,
			});
	}
}
