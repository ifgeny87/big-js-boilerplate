import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class DoesUserExist implements CanActivate
{
	constructor(
		private readonly usersService: UsersService,
	) {}

	canActivate = (context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> => {
		const request = context.switchToHttp().getRequest<Request>();
		return this.validateRequest(request);
	};

	validateRequest = async (request: Request): Promise<true> => {
		const { username } = request.body;
		if (!username) {
			throw new BadRequestException('Не указано имя пользователя');
		}
		const userExist = await this.usersService.findOneByUsername(username);
		if (userExist) {
			throw new ForbiddenException('Имя пользователя занято');
		}
		return true;
	};
}
