import * as meow from 'meow'

import chalk from 'chalk'

import { 
  listAvailableCommands, 
  commandMap, 
  getMeowConfig, 
  defaultHelp
} from './util'

import { logger } from '../util'

export function runCLI(argv: string[]) {
  try {
    const [, , commandArg] = argv

    if (!commandArg) {
      throw Error(`No command provided. Try: ${listAvailableCommands()}`)
    }
    if (!commandMap[commandArg]) {
      throw Error(
        `Command ${chalk.whiteBright.bold(
          commandArg
        )} does not exist.\nTry: ${listAvailableCommands()}`
      )
    }

    const SelectedCmd = commandMap[commandArg]

    logger.meta(SelectedCmd.commandName)

    const meowConfig = getMeowConfig(argv)

    if (SelectedCmd.additionalFlags) {
      meowConfig.flags = Object.assign(
        meowConfig.flags,
        SelectedCmd.additionalFlags
      )
    }

    const meowResult = meow(SelectedCmd.commandHelp, meowConfig)

    if (meowResult.flags.help || !commandArg) {
      logger.help(SelectedCmd.commandHelp + '\n' + defaultHelp)
      process.exit(0)
    }

    const Cmd = new SelectedCmd(meowResult.flags)
    Cmd.run()
  } 
  catch (err) {
    logger.error(err)
    process.exit(1)
  }

}
