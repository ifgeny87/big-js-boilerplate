import { Response } from 'express';
import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { DoesUserExist } from '../../core/guards/doesUserExist.guard';
import { isProd } from '../../core/config/env';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller()
export class AuthController
{
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@UseGuards(AuthGuard('local'))
	async login(
		@Req() req: any,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		const token = this.authService.login(req.user);
		res
			.status(HttpStatus.OK)
			.cookie('Authorization', token, {
				httpOnly: true,
				path: '/api/',
				maxAge: 2 * 86_400_000, // дублирует конфиг "jwt.signTime"
				secure: isProd,
			});
	}

	@Post('logout')
	@UseGuards(AuthGuard('jwt'))
	async logout(
		@Req() req: any,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		res
			.status(HttpStatus.OK)
			.cookie('Authorization', null, {
				httpOnly: true,
				path: '/api/',
				maxAge: -1,
				secure: isProd,
			});
	}

	@Post('register')
	@UseGuards(DoesUserExist)
	async register(@Body() user: RegisterUserDto): Promise<void> {
		await this.authService.register(user);
	}
}
