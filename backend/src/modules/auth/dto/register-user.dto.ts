import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto
{
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(50)
	declare readonly firstName: string;

	@IsOptional()
	@MinLength(1)
	@MaxLength(50)
	declare readonly lastName: string;

	@IsNotEmpty()
	@MinLength(4)
	@MaxLength(50)
	declare readonly username: string;

	@IsNotEmpty()
	@MinLength(4)
	@MaxLength(50)
	declare readonly password: string;
}
