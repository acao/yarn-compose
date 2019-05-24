import * as meow from "meow";
import * as buildOptions from "minimist-options";
import { Map } from "./types/types";
import { logger } from "./util";
import { Setup } from "./commands/Setup";
import { Relink } from "./commands/Relink";
import { Rebuild } from "./commands/Rebuild";
import { Command } from "./Command";

const defaultFlags: buildOptions.Options = {
  buildDir: {
    name: "buildDir",
    alias: "t"
  },
  configPath: {
    name: "configPath",
    alias: "c"
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
`;

const commands: Map<any> = {
  setup: Setup,
  relink: Relink,
  rebuild: Rebuild,
  none: Command
};

(async () => {
  try {
    const [, , commandArg]: string[] = process.argv;

    const SelectedCmd = commandArg ? commands[commandArg] || commands.none : commands.none;
    logger.meta(SelectedCmd.commandName);

    if (SelectedCmd.additionalFlags) {
      meowConfig.flags = Object.assign(meowConfig.flags, SelectedCmd.additionalFlags);
    }

    const otherArgs = meow(SelectedCmd.commandHelp, meowConfig);
    if (otherArgs.flags.help) {
      logger.help(SelectedCmd.commandHelp + "\n" + defaultHelpOptions);
      process.exit(0);
    }

    const Cmd = new SelectedCmd(otherArgs);
    await Cmd.run();
  } catch (err) {
    logger.error(err);
  }
})();
