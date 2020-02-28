we
==

We automate

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/we.svg)](https://npmjs.org/package/we)
[![Downloads/week](https://img.shields.io/npm/dw/we.svg)](https://npmjs.org/package/we)
[![License](https://img.shields.io/npm/l/we.svg)](https://github.com/vkbr/we/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g we
$ we COMMAND
running command...
$ we (-v|--version|version)
we/0.0.1 darwin-x64 node-v10.15.3
$ we --help [COMMAND]
USAGE
  $ we COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`we hello [FILE]`](#we-hello-file)
* [`we help [COMMAND]`](#we-help-command)

## `we hello [FILE]`

describe the command here

```
USAGE
  $ we hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ we hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/vkbr/we/blob/v0.0.1/src/commands/hello.ts)_

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
<!-- commandsstop -->
