import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ServiceNames } from '../const/service.names';
import { initSequelize } from './initSequelize';
import { User } from '../../modules/users/user.model';

export const databaseProviders = [
	{
		provide: ServiceNames.BACKEND_SERVICE,
		inject: [ConfigService],
		useFactory: async (configService: ConfigService) => {
			const logger = new Logger('sequelize');
			const sequelize = initSequelize({
				host: configService.get<string>('db.host'),
				port: configService.get<number>('db.port'),
				database: configService.get<string>('db.database'),
				username: configService.get<string>('db.username'),
				password: configService.get<string>('db.password'),
				logging: (msg: string) => logger.debug(msg),
			});
			sequelize.addModels([
				User,
			]);
			return sequelize;
		},
	},
];
