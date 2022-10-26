import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

/**
 * Фильтр отлавливает HttpException и наследуемые типы ошибок
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter
{
	catch(exception: HttpException, host: ArgumentsHost): any {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse();
		const status = exception.getStatus();
		res
			.status(status)
			.json({
				time: new Date().toISOString(),
				error: exception.message,
				response: exception.getResponse(),
			});
	}
}
