import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Transaction } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import { initSequelize } from './initSequelize';
import configuration from '../config/configuration';
import { AppLogger } from '../log/AppLogger';
import { DatabaseError } from '../errors/DatabaseError';

const MIGRATIONS_TABLE_NAME = 'migration_schema';

export default class MigrationApplier
{
	private readonly logger: AppLogger;
	private readonly db: Sequelize;

	constructor() {
		this.logger = new AppLogger(MigrationApplier.name);
		const config = configuration();
		this.db = initSequelize({
			host: config.db.host,
			port: config.db.port,
			database: config.db.database,
			username: config.db.username,
			password: config.db.password,
			logging: (msg: string) => this.logger.debug(msg),
			dialectOptions: {
				// потребуется выполнять скрипты
				multipleStatements: true,
			},
		});
	}

	private async select(sqlQuery: string): Promise<any[]> {
		return await this.db.query(sqlQuery, {
			type: QueryTypes.SELECT,
			plain: false,
		});
	}

	private async query(sqlQuery: string, transaction?: Transaction) {
		return this.db.query(sqlQuery, {
			type: QueryTypes.RAW,
			raw: true,
			transaction,
		});
	}

	/**
	 * Проверяет какие миграции уже были применены в БД.
	 * Если таблица миграций не существует, то создает ее.
	 */
	private findAppliedMigrationSet = async (): Promise<Set<string>> => {
		// проверяем наличие таблицы миграций
		const tableNames = await this.select(`SELECT table_name
                                              FROM information_schema.tables
                                              WHERE table_schema = 'public'
                                                AND table_type = 'BASE TABLE'
                                                and table_name = '${MIGRATIONS_TABLE_NAME}'`);
		if (!tableNames.length) {
			// таблица миграций не существует, создаем
			const query = `CREATE SEQUENCE ${MIGRATIONS_TABLE_NAME}_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
			
				CREATE TABLE migration_schema
                (
                    "id"        integer DEFAULT nextval('${MIGRATIONS_TABLE_NAME}_id_seq') NOT NULL,
                    "name"      character varying(100) NOT NULL,
                    "createdAt" timestamptz default now() NOT NULL,
                    CONSTRAINT "${MIGRATIONS_TABLE_NAME}_pkey" PRIMARY KEY ("id"),
                    CONSTRAINT "${MIGRATIONS_TABLE_NAME}_name_key" UNIQUE ("name")
                ) WITH (oids = false);`;
			await this.query(query);
			this.logger.log(`Создана таблица "${MIGRATIONS_TABLE_NAME}"`);
			return new Set();
		} else {
			// таблица миграция существует, вытаскиваем список ранее выполненных миграций
			const migrations = await this.select(`SELECT name
                                                  FROM ${MIGRATIONS_TABLE_NAME}`);
			return new Set(migrations.map(m => m.name));
		}
	};

	/**
	 * Выбирает файлы версионных миграций, которых еще нет в таблице миграций
	 * @param migrationSet
	 */
	private findAndFilterVersionMigrationFiles = (migrationSet: Set<string>): Array<string> => {
		return fs.readdirSync('migrations')
			.filter((fn: string) => fn?.substring(0, 1)[0] === 'V')
			.filter((fn: string) => !migrationSet.has(fn));
	}

	/**
	 * Выбирает файлы тестовых миграций, которых еще нет в таблице миграций
	 * @param migrationSet
	 */
	private findAndFilterTestMigrationFiles = (migrationSet: Set<string>): Array<string> => {
		return fs.readdirSync('migrations')
			.filter((fn: string) => fn?.substring(0, 1)[0] === 'T')
			.filter((fn: string) => !migrationSet.has(fn));
	}

	/**
	 * Сверяет имена файлов миграций с шаблоном.
	 * Если имя не соответствует, то кидает исключение.
	 */
	private checkMigrationFileNames = (fileNames: Array<string>): Array<string> => {
		const regex = /^[VT]\d{2,}__\w+\.sql$/;
		const badFileName = fileNames.find(fn => !regex.test(fn));
		if (badFileName) {
			throw new Error(`Имя файла миграции "${badFileName}" должно соответствовать шаблону "${regex}"`);
		}
		return fileNames;
	}

	/**
	 * Получает на вход список файлов с новыми миграциями.
	 * @param fileNames
	 */
	private applyMigrations = async (fileNames: Array<string>): Promise<void> => {
		fileNames = fileNames.sort();
		for (const fileName of fileNames) {
			await this.db.transaction(async tr => {
				const filePath = path.resolve('migrations', fileName);
				const sql = fs.readFileSync(filePath).toString();
				await this.query(sql);
				await this.query(`INSERT INTO ${MIGRATIONS_TABLE_NAME} (name)
                                  VALUES (${this.db.escape(fileName)})`);
			})
				.catch((error: any) => {
					throw new DatabaseError(`Не удалось выполнить скрипт миграции "${fileName}"`,
						error);
				});
		}
	}

	/**
	 * Выполняет версионные миграции
	 */
	migrateVersionFiles = async (): Promise<void> => {
		return await this.findAppliedMigrationSet()
			.then(this.findAndFilterVersionMigrationFiles)
			.then(this.checkMigrationFileNames)
			.then(this.applyMigrations)
			.catch(err => {
				throw new DatabaseError('[Ошибка выполнения версионной миграции]', err);
			});
	};

	/**
	 * Выполняет миграции для тестов
	 */
	migrateTestFiles = async (): Promise<void> => {
		return this.findAppliedMigrationSet()
			.then(this.findAndFilterTestMigrationFiles)
			.then(this.checkMigrationFileNames)
			.then(this.applyMigrations)
			.catch(err => {
				throw new DatabaseError('[Ошибка выполнения тестовой миграции]', err);
			});
	};

	/**
	 * Закрывает соединение с СУБД.
	 */
	close = async (): Promise<void> => {
		await this.db.close();
	};
}
