import { existsSync } from 'fs';
import { resolve } from 'path';
import { prompt } from 'inquirer';
import { spawnSync } from 'child_process';
import { default as axios } from 'axios';
import chalk from 'chalk';
import cliUx from 'cli-ux';
import concurrent from 'con-task-runner';
import coerce from 'semver/functions/coerce';
import Semver from 'semver/classes/semver';

import {
  semanticVersionExp,
  getLatestMajorUpgrade,
  getLatestMinorUpgrade,
  getLatestPatchUpgrade,
} from '../utils/version';

type UpgradePrompt = 'proceed' | 'prompt-each' | 'abort';
type Logger = (...msg: string[]) => void;

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
  hasEligibleUpgrade?: boolean;
  eligibleVersion?: Version;
  latestMajor?: Version;
  latestMinor?: Version;
  latestPatch?: Version;
}

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

const isDevDependencyPredicate = (d: Dep) => d.isDev;
const hasEligibleUpgradePredicate = (d: Dep) => d.hasEligibleUpgrade;

const hasBrokenDependencyPredicate = (d: Dep) => d.hasBrokenVersion;

const queryDependencies = (options: Options): Dep[] => {
  const packagePath = resolve('./package.json');

  if (!existsSync(packagePath)) {
    throw new Error('Could not find `package.json`');
  }

  const pkg = require(packagePath) as Package;

  return [
    ...getDependencyFactory(false)(pkg.dependencies).filter(pkg => !options.ignoreProd || isDevDependencyPredicate(pkg)),
    ...getDependencyFactory(true)(pkg.devDependencies).filter(pkg => !options.ignoreDev || !isDevDependencyPredicate(pkg)),
  ];
};

const enrichLatest = async (deps: Dep[], registry: string): Promise<void> => {
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
    const resp = await client.get(dep.name) as { data: RegistryInfo; status: number };
    const { data, status } = resp;

    if (status === 200) {
      const versions = Object
      .keys(data.versions)
      .filter(ver => ver.match(semanticVersionExp))
      .map(ver => coerce(ver)!);

      dep.latestMajor = getLatestMajorUpgrade(dep.version, versions);
      dep.latestMinor = getLatestMinorUpgrade(dep.version, versions);
      dep.latestPatch = getLatestPatchUpgrade(dep.version, versions);

      progress.increment();
    } else {
      throw new Error('Failed to fetch version info.');
    }
  });

  progress.stop();
};

const promptEligibileVersion = async (deps: Dep[], interactive: boolean, type: string, logger: Logger): Promise<UpgradePrompt> => {
  const messages = deps.map(dep => {
    const eligibleVersion = type === 'pach' ?
      dep.latestPatch :
      type === 'major' ?
        dep.latestMajor : dep.latestMinor;

    dep.eligibleVersion = eligibleVersion;
    const hasChange = eligibleVersion!.compare(dep.version) !== 0;
    dep.hasEligibleUpgrade = hasChange;

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
      { name: chalk.bold('Abort'), value: 'abort' },
    ],
  }) as { choice: UpgradePrompt };

  return response.choice;
};

function detectEngine(): Engines {
  if (existsSync(resolve('./package-lock.json'))) return 'npm';
  return 'yarn';
}

const engineUpgradeCommand = {
  npm: 'install',
  yarn: 'add',
} as const;

async function doUpgrade(interactiveResponse: UpgradePrompt, options: Options, deps: Dep[], logger: Logger) {
  if (interactiveResponse === 'abort') {
    return;
  }

  let filteredUpgrade = deps.filter(hasEligibleUpgradePredicate);

  if (interactiveResponse === 'prompt-each') {
    process.stdout.write('\x1b[2J');
    const response = await prompt({
      name: 'choice',
      message: 'Select',
      type: 'checkbox',
      choices: deps
      .filter(dep => dep.hasEligibleUpgrade)
      .map(dep => ({
        name: `${chalk.bold(dep.name)}: ${chalk.red(dep.version)} -> ${chalk.green(dep.eligibleVersion)}`,
        value: dep.name,
      })),
    });

    const selectedPackages = new Set(response.choice);

    filteredUpgrade = deps.filter(dep => selectedPackages.has(dep.name));
  }

  if (filteredUpgrade.length === 0) {
    logger('No package to upgrade');
    return;
  }

  const engine = options.engine === 'auto' ? detectEngine() : options.engine;
  const upgradeCmd = engineUpgradeCommand[engine];

  const args = [engine, [upgradeCmd, ...filteredUpgrade.map(pkg => `${pkg.name}@${pkg.eligibleVersion}`)], { stdio: 'inherit' }] as const;

  logger(chalk.gray(`$ ${args[0]} ${args[1].join(' \\\n')}`));

  spawnSync(...args);
}

type Engines = 'yarn' | 'npm';
export interface Options {
  interactive: boolean;
  mode: 'major' | 'minor' | 'patch';
  engine: Engines | 'auto';
  registry: string;
  ignoreDev: boolean;
  ignoreProd: boolean;
}

export default async (options: Options, logger: Logger = _ => _) => {
  logger('Upgrading');

  const dependencies = queryDependencies(options);
  const brokenDependencies = dependencies.filter(hasBrokenDependencyPredicate).length;

  logger(`Found ${dependencies.length} depdencies  (${
    dependencies.filter(isDevDependencyPredicate).length} dev${
    brokenDependencies ? `, ${brokenDependencies} broken` : ''}).`);

  await enrichLatest(dependencies, options.registry);

  const upgradePrompt = await promptEligibileVersion(dependencies, options.interactive, options.mode, logger);

  await doUpgrade(upgradePrompt, options, dependencies, logger);
};
