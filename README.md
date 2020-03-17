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
we-automate/0.2.3 darwin-x64 node-v10.15.3
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


## `we info [PACKAGENAME]`

Get page info (and more comparision if available)

```
USAGE
  $ we info [PACKAGENAME]

OPTIONS
  --registry=registry  [default: https://registry.npmjs.org/]

EXAMPLE

  $ we info react
  TypeScript is a language for application scale JavaScript development
  Latest: 3.8.3 (1510 versions)
  Minor upgrade available 3.3.0->3.8.3
  Patch upgrade available 3.3.0->3.3.3
```


## `we upgrade`

Upgrade npm dependencies

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

<!-- commandsstop -->
