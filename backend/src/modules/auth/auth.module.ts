import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('jwt.saltKey'),
				signOptions: {
					expiresIn: configService.get<string>('jwt.signTime'),
				},
			}),
		}),
	],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
	],
	controllers: [AuthController],
})
export class AuthModule {}
