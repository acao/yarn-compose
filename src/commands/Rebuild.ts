import meow from "meow";
import { Command } from "../Command";

export class Rebuild extends Command {
  static commandName = "rebuild";

  static commandHelp = `
    re-builds dependencies
  `;

  constructor(args: meow.Result) {
    super(args);
  }

  run() {
    this.eachProject(this.buildProject);
  }
}
