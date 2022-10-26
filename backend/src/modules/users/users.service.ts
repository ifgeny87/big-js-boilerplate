import { Inject, Injectable } from '@nestjs/common';
import { BaseModelService } from '../../core/services/BaseModelService';
import { User } from './user.model';
import { RepositoryNames } from '../../core/const/repository.names';

@Injectable()
export class UsersService extends BaseModelService<User>
{
	constructor(
		@Inject(RepositoryNames.USERS_REPOSITORY)
		private readonly usersRepository: typeof User,
	) {
		super(usersRepository);
	}

	findOneByIdAndUsername = async (userId: number, username: string): Promise<User | null> => {
		return await this.usersRepository.findOne({
			where: {
				id: userId,
				username,
			},
		});
	};

	findOneByUsername = async (username: string): Promise<User | null> => {
		return await this.usersRepository.findOne({ where: { username } });
	};
}
