import * as execa from "execa";
import * as meow from "meow";
import * as path from "path";
import * as fs from "fs";
import * as mkdirp from "mkdirp";

import { Command } from "../Command";
import { NodeProject } from "../types/types";
import { logger } from "../util";

export class Setup extends Command {
  static commandName = "setup";

  static commandHelp = `
sets up project workspace, 
clones and installs projects, type definitions, 
builds and links dependencies

Usage:
  $ yarn-compose 
    (expects projects.yml)
  $ yarn-compose -c path/to/config.yml
  `;

  constructor(args: meow.Result) {
    super(args);
  }

  private cloneTypeDefinitions() {
    logger.warn("setting up typeDefs, this could take a while... and a lot of bandwith...");
    for (let [typeDefName, typeInfo] of Object.entries(this.config.typeDefs)) {
      const typeDefPath = path.join(this.config.baseDir, "@types", typeDefName);
      if (!fs.existsSync(typeDefPath)) {
        mkdirp.sync(typeDefPath);
      }
      if (fs.existsSync(path.join(typeDefPath, ".git"))) {
        return;
      }
      execa.sync("git", ["clone", typeInfo.remote, typeDefPath, "--branch", typeInfo.branch, "--depth", "1"], {
        cwd: typeDefPath
      });
      return logger.info(`cloned typeDefinition for ${typeDefName}`);
    }
  }

  private setupWorkingDirectory() {
    const cwd = path.join(this.config.baseDir);
    let isGitRepo = true;
    try {
      execa.sync("git", ["status"], { cwd });
    } catch (err) {
      isGitRepo = false;
    }
    if (isGitRepo) {
      logger.error(`cannot intialize in a git repository`);
      process.exit(1);
      return;
    }
    if (!fs.existsSync(cwd)) {
      logger.warn(`creating working directory`);
      mkdirp.sync(this.config.baseDir);
    }
  }

  private cloneAndInstall(projectDir: string, project: NodeProject, countOf: number[]) {
    super.cloneProject(project.remote, projectDir);
    super.checkoutBranch(projectDir, project.branch);
    logger.iterateInfo(`cloned and checked out ${project.package}#${project.branch}`, countOf);
    super.installDependencies(projectDir, project, countOf);
  }

  private setupProject(projectDir: string, project: NodeProject, countOf: number[]) {
    if (project.types) {
      super.linkTypes(projectDir, project);
    }
    super.linkDependencies(projectDir, project, countOf);
    super.buildProject(projectDir, project, countOf);
    super.linkSelf(projectDir, project);
  }

  public async run() {
    this.setupWorkingDirectory();
    await Promise.all([this.cloneTypeDefinitions(), super.eachProject(this.cloneAndInstall)]);
    await super.eachProject(this.setupProject.bind(this));
  }
}
