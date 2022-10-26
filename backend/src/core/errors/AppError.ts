export class AppError extends Error
{
	readonly name = this.constructor.name;

	constructor(
		message: string,
		public readonly parent?: Error,
		public readonly isOperational?: boolean,
	) {
		super(message);
	}
}
