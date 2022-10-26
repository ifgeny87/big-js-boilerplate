import { RepositoryNames } from '../../core/const/repository.names';
import { User } from './user.model';

export const usersProviders = [
	{
		provide: RepositoryNames.USERS_REPOSITORY,
		useValue: User,
	},
];
