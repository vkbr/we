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

type Version = Semver | null;

export interface Dep {
  name: string;
  version: Version;
  isDev: boolean;
  hasBrokenVersion: boolean;
  latestMajor?: Version;
  latestMinor?: Version;
  latestPatch?: Version;
}

const getDependencyFactory = (isDev: boolean) => (dependencies: Record<string, string>): Dep[] => Object
.keys(dependencies)
.map(name  => {
  const version = coerce(dependencies[name]);

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
