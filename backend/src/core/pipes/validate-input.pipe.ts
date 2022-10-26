import { ArgumentMetadata, Injectable, ValidationPipe } from '@nestjs/common';

@Injectable()
export class ValidateInputPipe extends ValidationPipe
{
	transform = async (value: any, metadata: ArgumentMetadata) => {
		return await super.transform(value, metadata);
	};
}
