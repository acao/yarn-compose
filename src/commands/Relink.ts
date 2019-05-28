import meow from "meow";
import { Command } from "../Command";
import { NodeProject, TaskOptions } from "../types";

import { linkTypes, linkDependencies, linkSelf } from "../lib";

const linkedFilter = (project: NodeProject) => !!project.links && project.links.length > 0;

export class Relink extends Command {
  static commandName = "relink";

  static commandHelp = `
    re-links dependencies
  `;

  constructor(args: meow.Result) {
    super(args);
    this.relinkDependencies = this.relinkDependencies.bind(this);
  }

  private relinkDependencies(projectDir: string, project: NodeProject, opts: TaskOptions) {
    if (project.types) {
      linkTypes(projectDir, project, this.config);
    }
    linkDependencies(projectDir, project, opts);
  }

  public run() {
    super.eachProject(linkSelf);
    super.eachProject(this.relinkDependencies, {
      filter: linkedFilter
    });
  }
}
