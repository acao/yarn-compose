import * as meow from "meow";
import * as buildOptions from "minimist-options";
import chalk from 'chalk'
import { Map } from "./types";
import { logger } from "./util";
import { Setup } from "./commands/Setup";
import { Relink } from "./commands/Relink";
import { Rebuild } from "./commands/Rebuild";

const defaultFlags: buildOptions.Options = {
  buildDir: {
    name: "buildDir",
    alias: "t"
  },
  configPath: {
    name: "configPath",
    alias: "c"
  },
  help: {
    name: "help",
    alias: "h"
  }
};

const meowConfig = {
  flags: defaultFlags,
  autoHelp: false,
  argv: process.argv.slice(3)
};

const defaultHelpOptions = `
Global Options:

--base-dir, -t
  specify which build directory to target.
  overrides config file value

--config-path, -c
  specify path to config file
  ./projects.yml by default

--help, -h
  help with the particular command
`;

const commands: Map<any> = {
  setup: Setup,
  relink: Relink,
  rebuild: Rebuild
};

const listAvailableCommands = () => {
  return Object.values(commands)
    .filter(cmd => cmd.commandName)
    .reduce((list, cmd) => `${list}\n - yarn-compose ${cmd.commandName}`, "");
};

(async () => {
  try {
    const [, , commandArg]: string[] = process.argv;

    if (!commandArg) {
      throw Error(`No command provided. Try: ${listAvailableCommands()}`);
    }
    if (!commands[commandArg]) {
      throw Error(`Command ${chalk.whiteBright.bold(process.argv[2])} does not exist.\nTry: ${listAvailableCommands()}`);
    }

    const SelectedCmd = commands[commandArg];

    logger.meta(SelectedCmd.commandName);

    if (SelectedCmd.additionalFlags) {
      meowConfig.flags = Object.assign(meowConfig.flags, SelectedCmd.additionalFlags);
    }

    const otherArgs = meow(SelectedCmd.commandHelp, meowConfig);
    if (otherArgs.flags.help || !commandArg) {
      logger.help(SelectedCmd.commandHelp + "\n" + defaultHelpOptions);
      process.exit(0);
    }

    const Cmd = new SelectedCmd(otherArgs);
    await Cmd.run();
  } catch (err) {
    logger.error(err);
    process.exit(1)
  }
})();
