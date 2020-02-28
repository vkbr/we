import { existsSync } from 'fs';
import { resolve } from 'path';
import coerce from 'semver/functions/coerce';
import Semver from 'semver/classes/semver';

type Package = {
  name: string;
  version: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

export interface Dep {
  name: string;
  version: Semver;
  isDev: boolean;
  latestMajor?: Semver;
  latestMinor?: Semver;
  latestPatch?: Semver;
}

const getDependencyFactory = (isDev: boolean) => (dependencies: Record<string, string>): Dep[] => Object
.keys(dependencies)
.map(name  => ({
  name,
  isDev,
  version: coerce(dependencies[name])!,
}));

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
