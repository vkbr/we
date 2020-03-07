import { Command, flags } from '@oclif/command';

import infoApi, { Options, Args } from '../api/info';

export default class Info extends Command {
	static flags = {
		registry: flags.string({
      default: 'https://registry.npmjs.org/',
    }),
	};

	static args = [
		{ name:  'packageName' },
	];

	async run () {
		const { flags, args } = this.parse(Info);

		infoApi(flags as Options, args as Args, this.log);
	}
}
