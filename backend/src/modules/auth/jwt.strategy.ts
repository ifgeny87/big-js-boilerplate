import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth-user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{
	constructor(
		private readonly configService: ConfigService,
		private readonly usersService: UsersService,
	) {
		super({
			jwtFromRequest: (req: Request): string => {
				// получаем JWT токен из куки
				return req?.cookies?.Authorization;
			},
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('jwt.saltKey'),
		});
	}

	validate = async (payload: { sub: number, username: string }): Promise<AuthUser> => {
		const user = await this.usersService.findOneByIdAndUsername(payload.sub, payload.username);
		if (!user) {
			throw new UnauthorizedException('Вы не можете получить доступ без авторизации');
		}
		return {
			id: user.id,
			username: user.username,
		};
	};
}
