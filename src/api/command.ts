import { existsSync } from 'fs';
import { resolve } from 'path';
import { default as axios } from 'axios';
import concurrent from 'con-task-runner';
import coerce from 'semver/functions/coerce';
import gt from 'semver/functions/gt';
import Semver from 'semver/classes/semver';

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

const semanticVersionExp = /^(\d\.){2}\d$/;

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

export const enrichLatest = async (deps: Dep[], _?: string): Promise<void> => {
  const taskRunner = concurrent({ concurrency: 5, limit: deps.length });

  const client = axios.create({ baseURL: 'http://registry.npmjs.org/', responseType: 'json' });

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
    } else {
      throw new Error('Failed to fetch version info.');
    }
  });
};
