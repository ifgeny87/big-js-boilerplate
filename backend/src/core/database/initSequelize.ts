import { Sequelize } from 'sequelize-typescript';
import * as pg from 'pg';

export function initSequelize(options: any) {
	options = {
		dialect: 'postgres',
		dialectModule: pg,
		define: {
			// если сделать false, то в полях createdAt и updatedAt данных не будет в методах toDto
			timestamps: true,
		},
		...options,
	}
	return new Sequelize(options);
}
