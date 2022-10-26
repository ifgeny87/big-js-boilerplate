import { Module } from '@nestjs/common';
import { databaseProviders } from './database.proviers';

@Module({
	providers: [...databaseProviders],
	exports: [...databaseProviders],
})
export class DatabaseModule {}
