import { Command, flags } from '@oclif/command';

import doUpgrade, { Options } from '../api/upgrade';

export default class Upgrade extends Command {
  static description = 'upgrade npm dependencies'

  // static examples = [
  //   '$ we upgrade',
  // ];

  static flags = {
    interactive: flags.boolean({ char: 'i' }),
    mode: flags.enum({
      char: 'm',
      description: 'name to print',
      options: ['major', 'minor', 'patch'],
      default: 'minor',
    }),
    registry: flags.string({
      default: 'http://registry.npmjs.org/',
    }),
    ignoreDev: flags.boolean({
      char: 'D',
      description: 'when true, the dev-dependencies will be ignored',
      default: false,
      exclusive: ['ignoreProd'],
    }),
    ignoreProd: flags.boolean({
      char: 'P',
      description: 'when true, the prod-dependencies(non-dev) will be ignored',
      default: false,
      exclusive: ['ignoreDev'],
    }),
  };

  async run() {
    const { flags } = this.parse(Upgrade);
    await doUpgrade(flags as Options);
  }
}
