import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';

const CONFIG_PATH = process.env.CONFIG_PATH || 'config.yaml';

export default () => {
	return yaml.load(
		readFileSync(CONFIG_PATH, 'utf8'),
	) as Record<string, any>;
}
