import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
@Table({ tableName: 'users' })
export class User extends Model<User>
{
	@Expose()
	@AutoIncrement
	@PrimaryKey
	@Column({})
	declare id: number;

	@Expose()
	@Column({ type: DataType.STRING(50), allowNull: false })
	declare firstName?: string;

	@Expose()
	@Column({ type: DataType.STRING(50) })
	declare lastName?: string;

	@Expose()
	@Column({ type: DataType.STRING(50), allowNull: false })
	declare username: string;

	@Column({ type: DataType.STRING(150) })
	declare passwordHash?: string;

	@Expose()
	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
	declare isActive: boolean;
}
