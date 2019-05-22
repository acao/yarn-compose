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
  argv: process.argv.slice(3)
};

const commands: Map<any> = {
  setup: Setup,
  relink: Relink,
  rebuild: Rebuild,
  none: Command
};

try {
  const [, ,commandArg]: string[] = process.argv;

  const SelectedCmd = commandArg ? commands[commandArg] || commands.none : commands.none;

  if (SelectedCmd.additionalFlags) {
    meowConfig.flags = Object.assign(meowConfig.flags, SelectedCmd.additionalFlags);
  }

  const otherArgs = meow(SelectedCmd.commandHelp, meowConfig);

  const Cmd = new SelectedCmd(otherArgs);
  logger.meta(SelectedCmd.commandName);
  Cmd.run();
} catch (err) {
  logger.error(err);
}

