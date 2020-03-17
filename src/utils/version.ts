import SemVer from 'semver/classes/semver';
import gt from 'semver/functions/gt';

export const semanticVersionExp = /^(\d\.){2}\d$/;

const chooseGreater = (a: SemVer, b: SemVer): SemVer => gt(a, b) ? a : b;

export const getLatestMajorUpgrade = (version: SemVer, versions: SemVer[]): SemVer =>
  versions.reduce(chooseGreater, version);

export const getLatestMinorUpgrade = (version: SemVer, versions: SemVer[]): SemVer => versions
.reduce((prev: SemVer, next: SemVer) => next.major === prev.major ? chooseGreater(next, prev) : prev, version);

export const getLatestPatchUpgrade = (version: SemVer, versions: SemVer[]): SemVer => versions
.reduce((prev: SemVer, next: SemVer) => next.major === prev.major && next.minor === prev.minor ? chooseGreater(next, prev) : prev, version);
