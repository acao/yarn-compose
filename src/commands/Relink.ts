import meow from 'meow';
import { Command } from '../Command';
import { NodeProject } from '../types/types';

export class Relink extends Command {
  static commandName = 'relink';

  static commandHelp = `
    re-links dependencies
  `;

  constructor(args: meow.Result) {
    super(args);
  }

  relinkProject(projectDir: string, project: NodeProject) {
    if (project.types) {
      this.linkTypes(projectDir, project);
    }
    this.linkDependencies(projectDir, project);
    this.linkSelf(projectDir, project);
  }

  run() {
    this.eachProject(this.relinkProject);
  }
}
