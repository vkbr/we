import Axios from 'axios';
import chalk = require('chalk');
import { resolve } from 'path';
import coerce from 'semver/functions/coerce';
import SemVer from 'semver/classes/semver';
import compare from 'semver/functions/compare';

import { semanticVersionExp, getLatestMajorUpgrade, getLatestMinorUpgrade, getLatestPatchUpgrade } from '../utils/version';

export interface Options {
	registry: String;
}

export interface Args {
	packageName: string;
}

export default async (options: Options, { packageName }: Args, logger: (...msg: string[]) => void = () => {}) => {
	const { data, status } = await Axios.get(`${options.registry}/${packageName}`, { responseType: 'json' });

	if (status === 200) {
		logger(chalk.gray(data.description));
		logger(chalk.bold(`Latest: ${chalk.blue(data['dist-tags'].latest)} (${Object.keys(data.versions).length} versions)`));
		try {
			const pkgJson = require(resolve('./package.json'));
			let version = coerce(pkgJson.dependencies[packageName] || pkgJson.devDependencies[packageName]);

			if (version !== null) {
				const versions = Object
				.keys(data.versions)
				.filter(ver => ver.match(semanticVersionExp))
				.map(ver => coerce(ver))
				.filter(ver => ver !== null) as SemVer[];

				const majorUpgrade = getLatestMajorUpgrade(version, versions);
				const minorUpgrade = getLatestMinorUpgrade(version, versions);
				const patchUpgrade = getLatestPatchUpgrade(version, versions);

				if (compare(version, majorUpgrade) && compare(majorUpgrade, minorUpgrade) && compare(majorUpgrade, patchUpgrade)) {
					logger(`Major upgrade available ${chalk.red(version)}->${chalk.green(majorUpgrade)}`);
				}

				if (compare(version, minorUpgrade) && compare(minorUpgrade, patchUpgrade)) {
					logger(`Minor upgrade available ${chalk.red(version)}->${chalk.green(minorUpgrade)}`);
				}

				if (compare(version, patchUpgrade)) {
					logger(`Patch upgrade available ${chalk.red(version)}->${chalk.green(patchUpgrade)}`);
				}
			}
		} catch (error) {
		}
	} else {
		logger(chalk.red('Error', data));
	}
};
