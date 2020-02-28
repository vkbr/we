import { Command, flags } from '@oclif/command';

import { queryDependencies } from '../api/command';

export default class Upgrade extends Command {
  static description = 'upgrade npm dependencies'

  static examples = [
    '$ we upgrade',
  ];

  static flags = {
    interactive: flags.boolean({ char: 'i' }),
    mode: flags.enum({
      char: 'm',
      description: 'name to print',
      options: ['major', 'minor', 'patch'],
      default: 'minor',
    }),
  };

  async run() {
    // const {args, flags} = this.parse(Upgrade)
    this.log('Upgrading');

    const dependencies = queryDependencies();

    this.log(`Found ${dependencies.length} depdencies (${dependencies.filter(d => d.isDev).length} dev).`);
  }
}
