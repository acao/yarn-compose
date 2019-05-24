import meow from "meow";
import { Command } from "../Command";
import { NodeProject } from "../types/types";

export class Relink extends Command {
  static commandName = "relink";

  static commandHelp = `
    re-links dependencies
  `;

  constructor(args: meow.Result) {
    super(args);
  }

  private relinkProject(projectDir: string, project: NodeProject, countOf: number[]) {
    if (project.types) {
      this.linkTypes(projectDir, project);
    }
    this.linkDependencies(projectDir, project, countOf);
    this.linkSelf(projectDir, project);
  }

  public run() {
    super.eachProject(this.relinkProject.bind(this));
  }
}
