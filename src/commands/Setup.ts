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
    sets up project workspace, clones and installs projects, typedefinitions, builds and links
  `;

  constructor(args: meow.Result) {
    super(args);
  }

  cloneTypeDefinitions() {
    for (let [typeDefName, typeInfo] of Object.entries(this.config.typeDefs)) {
      const typeDefPath = path.join(this.config.baseDir, "@types", typeDefName);
      if (!fs.existsSync(typeDefPath)) {
        mkdirp.sync(typeDefPath);
      }
      if (fs.existsSync(path.join(typeDefPath, ".git"))) {
        return;
      }
      execa.sync("git",
        ["clone", typeInfo.remote, typeDefPath, "--branch", typeInfo.branch, "--depth", "1"], 
        { cwd: typeDefPath }
      );
    }
  }

  setupWorkingDirectory() {
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

  setupGitRepos(projectDir: string, project: NodeProject) {
    super.cloneProject(project.remote, projectDir);
    super.checkoutBranch(projectDir, project.branch);
    logger.info(`cloned and checked out ${project.package}#${project.branch}`);
  }

  setupProject(projectDir: string, project: NodeProject) {
    super.installDependencies(projectDir, project);
    if (project.types) {
      super.linkTypes(projectDir, project);
    }
    super.linkDependencies(projectDir, project);
    super.buildProject(projectDir, project);
    super.linkSelf(projectDir, project);
  }

  run() {
    this.setupWorkingDirectory();
    super.eachProject(this.setupGitRepos);
    logger.warn("setting up typeDefs, this could take a while... and a lot of bandwith...");
    this.cloneTypeDefinitions();
    logger.info("type defs setup");
    super.eachProject(this.setupProject.bind(this));
  }
}
