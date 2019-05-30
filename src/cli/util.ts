import * as buildOptions from 'minimist-options'

import { Map } from '../types'
import { Setup } from '../commands/Setup'
import { Relink } from '../commands/Relink'
import { Rebuild } from '../commands/Rebuild'

export const commandMap: Map<any> = {
  setup: Setup,
  install: Setup,
  relink: Relink,
  rebuild: Rebuild,
}

export const defaultHelp = `
Global Options:

--base-dir, --target-dir, -b, -t
  specify which build directory to target.
  overrides config file value

--config-path, -c
  specify path to config file
  ./projects.yml by default

--help, -h
  help with the particular command
`

export const defaultFlags: buildOptions.Options = {
  buildDir: {
    name: 'baseDir',
    alias: 'b',
    default: null,
    type: 'string',
  },
  targetDir: {
    name: 'targetDir',
    alias: 't',
    default: null,
    type: 'string',
  },
  configPath: {
    name: 'configPath',
    alias: 'c',
    type: 'string',
  },
  help: {
    name: 'help',
    alias: 'h',
    type: 'boolean',
  },
}

export const listAvailableCommands = () => {
  return Object.values(commandMap)
    .filter(cmd => cmd.commandName)
    .reduce((list, cmd) => `${list}\n - yarn-compose ${cmd.commandName}`, '')
}

export const getMeowConfig = (argv: string[]) => ({
  flags: defaultFlags,
  autoHelp: false,
  argv: argv.slice(3),
})
