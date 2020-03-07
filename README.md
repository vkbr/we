we
==

We automate

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/we-automate.svg)](https://npmjs.org/package/we-automate)
[![Downloads/week](https://img.shields.io/npm/dw/we-automate.svg)](https://npmjs.org/package/we-automate)
[![License](https://img.shields.io/npm/l/we-automate.svg)](https://github.com/vkbr/we/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g we-automate
$ we COMMAND
running command...
$ we (-v|--version|version)
we-automate/0.2.0 darwin-x64 node-v12.16.1
$ we --help [COMMAND]
USAGE
  $ we COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`we help [COMMAND]`](#we-help-command)
* [`we info [PACKAGENAME]`](#we-info-packagename)
* [`we upgrade`](#we-upgrade)

## `we help [COMMAND]`

display help for we

```
USAGE
  $ we help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `we info [PACKAGENAME]`

```
USAGE
  $ we info [PACKAGENAME]

OPTIONS
  --registry=registry  [default: https://registry.npmjs.org/]
```

_See code: [src/commands/info.ts](https://github.com/vkbr/we/blob/v0.2.0/src/commands/info.ts)_

## `we upgrade`

upgrade npm dependencies

```
USAGE
  $ we upgrade

OPTIONS
  -D, --ignoreDev                 when true, the dev-dependencies will be ignored
  -P, --ignoreProd                when true, the prod-dependencies(non-dev) will be ignored
  -e, --engine=(auto|yarn|npm)    [default: auto] select engine to upgrade
  -i, --interactive
  -m, --mode=(major|minor|patch)  [default: minor] limiting your upgrade to major/minor/patch versions
  --registry=registry             [default: https://registry.npmjs.org/]
```

_See code: [src/commands/upgrade.ts](https://github.com/vkbr/we/blob/v0.2.0/src/commands/upgrade.ts)_
<!-- commandsstop -->
