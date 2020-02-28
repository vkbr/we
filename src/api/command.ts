import { existsSync } from 'fs';
import { resolve } from 'path';
import { prompt } from 'inquirer';
import { default as axios } from 'axios';
import chalk from 'chalk';
import cliUx from 'cli-ux';
import concurrent from 'con-task-runner';
import coerce from 'semver/functions/coerce';
import gt from 'semver/functions/gt';
import Semver from 'semver/classes/semver';

type UpgradePrompt = 'proceed' | 'prompt-each' | 'abort';

type Package = {
  name: string;
  version: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

type RegistryInfo = {
  _id: string;
  name: string;
  versions: Record<string, RegistryInfo>;
};

type Version = Semver;

export interface Dep {
  name: string;
  version: Version;
  isDev: boolean;
  hasBrokenVersion: boolean;
  eligibleVersion?: Version;
  latestMajor?: Version;
  latestMinor?: Version;
  latestPatch?: Version;
}

const semanticVersionExp = /^(\d\.){2}\d$/;

const getDependencyFactory = (isDev: boolean) => (dependencies: Record<string, string>): Dep[] => Object
.keys(dependencies)
.map(name  => {
  const version = coerce(dependencies[name])!;

  return {
    name,
    isDev,
    version,
    hasBrokenVersion: version === null,
  };
});

export const isDevDependencyPredicate = (d: Dep) => d.isDev;

export const hasBrokenDependencyPredicate = (d: Dep) => d.hasBrokenVersion;

export const queryDependencies = (): Dep[] => {
  const packagePath = resolve('./package.json');

  if (!existsSync(packagePath)) {
    throw new Error('Could not find `package.json`');
  }

  const pkg = require(packagePath) as Package;

  return [
    ...getDependencyFactory(false)(pkg.dependencies),
    ...getDependencyFactory(true)(pkg.devDependencies),
  ];
};

export const enrichLatest = async (deps: Dep[], registry: string): Promise<void> => {
  const taskRunner = concurrent({ concurrency: 5, limit: deps.length });

  const client = axios.create({ baseURL: registry, responseType: 'json' });
  const progress = cliUx.progress({
    format: 'Enquiring  packages | {bar} | {value}/{total}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  });

  progress.start(deps.length, 0);

  await taskRunner(async idx => {
    const dep = deps[idx];
    const { data, status } = await client.get(dep.name) as { data: RegistryInfo; status: number };

    if (status === 200) {
      const versions = Object
      .keys(data.versions)
      .filter(ver => ver.match(semanticVersionExp))
      .map(ver => coerce(ver)!);

      dep.latestMajor = versions
      .reduce((prev: Semver, next: Semver) => gt(next, prev) ? next : prev, dep.version!);

      dep.latestMinor = versions
      .reduce((prev: Semver, next: Semver) => next.major === prev.major && gt(next, prev) ? next : prev, dep.version!);

      dep.latestPatch = versions
      .reduce((prev: Semver, next: Semver) => next.major === prev.major && next.minor === prev.minor && next.patch > prev.patch ? next : prev, dep.version!);

      progress.increment();
    } else {
      throw new Error('Failed to fetch version info.');
    }
  });

  progress.stop();
};

export const promptEligibileVersion = async (deps: Dep[], interactive: boolean, type: string, logger: (...msg: string[]) => void): Promise<UpgradePrompt> => {
  const messages = deps.map(dep => {
    const eligibleVersion = type === 'pach' ?
      dep.latestPatch :
      type === 'major' ?
        dep.latestMajor : dep.latestMinor;

    dep.eligibleVersion = eligibleVersion;
    const hasChange = eligibleVersion!.compare(dep.version);

    if (!hasChange) return null;

    return `${chalk.bold(dep.name)}: ${chalk.red(dep.version)} -> ${chalk.green(eligibleVersion)}`;
  })
  .filter(msg => msg !== null);

  logger(`\n${messages.join('\n')}`);

  if (!interactive) {
    logger(chalk.blue('Upgrading above changes.'));
    return 'proceed';
  }

  const response = await prompt({
    name: 'choice',
    message: chalk.blue('Proceed with these upgrades'),
    type: 'list',
    choices: [
      { name: `${chalk.bold('Proceed')}${chalk.gray(' make all upgrade')}`, value: 'proceed' },
      { name: `${chalk.bold('Prompt each')}${chalk.gray(' prompt before each package')}`, value: 'prompt-each' },
      { name: chalk.bold('Abort') },
    ],
  }) as { choice: UpgradePrompt };

  return response.choice;
};
