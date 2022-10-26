import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as sjcl from 'sjcl';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth-user.model';
import { User } from '../users/user.model';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService
{
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	validateUser = async (username: string, password: string): Promise<User> => {
		const user = await this.usersService.findOneByUsername(username);
		if (!user || !user.passwordHash) {
			return;
		}
		if (await this.comparePassword(password, user.passwordHash)) {
			return user;
		}
	};

	login = (user: AuthUser): string => {
		return this.jwtService.sign({ sub: user.id, username: user.username });
	};

	register = async (user: LoginUserDto): Promise<void> => {
		const { password, ...userParts } = user;
		const passwordHash = await this.hashPassword(password);
		await this.usersService.create({
			...userParts,
			passwordHash,
		});
	};

	private hashPassword = async (password: string): Promise<string> => {
		const myBitArray = sjcl.hash.sha256.hash(password);
		return sjcl.codec.hex.fromBits(myBitArray);
	};

	private comparePassword = async (entered: string, dbPassword: string): Promise<boolean> => {
		const myBitArray = sjcl.hash.sha256.hash(entered);
		return dbPassword === sjcl.codec.hex.fromBits(myBitArray);
	};
}
