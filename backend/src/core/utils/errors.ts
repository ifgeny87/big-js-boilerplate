import * as util from 'util';

/**
 * Формирует текст из ошибки с учетом родителей и splat объекта
 * @param error
 */
export function parseError(error: any): string {
	const lines: string[] = [];
	let left = '';
	while (error) {
		const parts: string[] = [];
		const { stack, message, name, parent, original, ...other } = error;
		// original - это аргумент из ошибок Sequelize, это копия parent
		const line = stack || message || name;
		parts.push(line);
		Object.keys(other).forEach(key => {
			const value = other[key];
			if (value !== undefined) {
				parts.push(util.format('  • %s: %o', key, value));
			}
		});
		lines.push(parts.join('\n').split('\n').map((s, i) => i ? left + s : s).join('\n'));
		error = error.parent;
		if (error) {
			lines.push('\n' + left + '  ⚠️ throwed by ');
		}
		left += '  ';
	}
	return lines.join('');
}
