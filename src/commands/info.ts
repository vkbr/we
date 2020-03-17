import { Command, flags } from '@oclif/command';

import infoApi, { Options, Args } from '../api/info';
import chalk = require('chalk');

export default class Info extends Command {
static description = 'Get page info (and more comparision if available)';

static flags = {
  registry: flags.string({
    default: 'https://registry.npmjs.org/',
  }),
};

static args = [
  { name: 'packageName' },
];

static examples = [`
$ we info react
${chalk.gray('TypeScript is a language for application scale JavaScript development')}
${chalk.bold(`Latest: ${chalk.blue('3.8.3')} (1510 versions)`)}
Minor upgrade available ${chalk.red('3.3.0')}->${chalk.green('3.8.3')}
Patch upgrade available ${chalk.red('3.3.0')}->${chalk.green('3.3.3')}
`];

async run() {
  const { flags, args } = this.parse(Info);

  infoApi(flags as Options, args as Args, this.log);
}
}
