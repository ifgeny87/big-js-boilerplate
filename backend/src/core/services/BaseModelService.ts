import { Model } from 'sequelize-typescript';

export class BaseModelService<T extends Model>
{
	constructor(private readonly repository: any) {}

	create = async (dto: any): Promise<T> => {
		return await this.repository.create(dto);
	};

	createAll = async (dtos: any[]): Promise<T> => {
		return await this.repository.bulkCreate(dtos);
	};

	findAll = async (options?: any): Promise<T[]> => {
		return await this.repository.findAll(options);
	};

	findOne = async (id: number): Promise<T> => {
		return await this.repository.findOne({ where: { id } });
	};

	update = async (dbEntity: T, dto: Partial<T>): Promise<T> => {
		return await dbEntity.update(dto);
	};

	remove = async (id: number): Promise<void> => {
		const dbEntity = await this.findOne(id);
		return await dbEntity.destroy();
	};
}
