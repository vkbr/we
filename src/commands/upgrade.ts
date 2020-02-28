import { Command, flags } from '@oclif/command';

import {
  enrichLatest,
  hasBrokenDependencyPredicate,
  isDevDependencyPredicate,
  queryDependencies,
  promptEligibileVersion,
} from '../api/command';

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
    registry: flags.string({
      default: 'http://registry.npmjs.org/',
    }),
  };

  async run() {
    const { flags } = this.parse(Upgrade);
    this.log('Upgrading');

    const dependencies = queryDependencies();
    const brokenDependencies = dependencies.filter(hasBrokenDependencyPredicate).length;

    this.log(`Found ${dependencies.length} depdencies  (${
      dependencies.filter(isDevDependencyPredicate).length} dev${
      brokenDependencies ? `, ${brokenDependencies} broken` : ''}).`);

    await enrichLatest(dependencies, flags.registry);

    promptEligibileVersion(dependencies, flags.interactive, flags.mode, this.log);
  }
}
