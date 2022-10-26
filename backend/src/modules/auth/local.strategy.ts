import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUser } from './auth-user.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy)
{
	constructor(
		private readonly authService: AuthService,
	) {
		super();
	}

	validate = async (username: string, password: string): Promise<AuthUser> => {
		const user = await this.authService.validateUser(username, password);
		if (!user) {
			throw new BadRequestException('Реквизиты не зарегистрированы');
		}
		return {
			id: user.id,
			username: user.username,
		};
	};
}
