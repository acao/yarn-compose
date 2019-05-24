import * as path from "path";
import * as execa from "execa";
import * as fs from "fs";
import * as rimraf from "rimraf";
import * as Ajv from "ajv";
import * as meow from "meow";

import { logger, getConfig } from "./util";
import { CommandConfig, NodeProject } from "./types/types";
import { configSchema } from "./schema";

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

const ajvValidator = ajv.compile(configSchema);

export class Command {
  args: any;
  input: string[];
  config: CommandConfig;
  configPath: string;

  static commandHelp = `Command ${process.argv[2]} does not exist. Try setup, relink, or rebuild`;

  constructor(args: meow.Result) {
    this.input = args.input;
    this.args = args.flags;
    this.configPath = args.flags.configPath || path.join(process.cwd(), "projects.yml");
    this.config = this.getCommandConfig();
    this.config.baseDir = args.flags.baseDir || this.config.baseDir;
  }

  private getCommandConfig(): CommandConfig {
    if (!fs.existsSync(this.configPath)) {
      logger.error(`config file doesnt exist:\n ${this.configPath}`);
      process.exit(1);
    }
    const config = getConfig(this.configPath);
    this.validateConfig(config);
    return config;
  }

  private validateConfig(config: CommandConfig) {
    const valid = ajvValidator(config);
    if (!valid) {
      logger.error(`Invalid configuration file:`);
      logger.error(JSON.stringify(ajvValidator.errors, null, 2));
      process.exit(1);
    }
    return valid;
  }

  public eachProject(fn: Function) {
    let value = 0;
    for (const project of this.config.projects) {
      value++;
      const projectDir = path.join(this.config.baseDir, project.package);
      fn(projectDir, project, [value, this.config.projects.length]);
    }
  }

  public cloneProject(remote: string, projectDir: string) {
    if (!fs.existsSync(projectDir)) {
      execa.sync("git", ["clone", remote, projectDir]);
      return;
    }
    logger.warn(`${projectDir} already exists`);
  }

  public checkoutBranch(projectDir: string, branch: string) {
    return execa.sync("git", ["checkout", branch], { cwd: projectDir });
  }

  public installDependencies(projectDir: string, project: NodeProject, countOf: number[]) {
    execa.sync("yarn", ["install", "--ignore-scripts"], { cwd: projectDir });
    logger.iterateInfo(`installed dependencies for ${project.package}`, countOf);
  }

  public buildProject(projectDir: string, project: NodeProject, countOf: number[]) {
    if (project.lerna) {
      execa.sync("lerna", ["run", "build"], { cwd: projectDir });
      logger.iterateInfo(`built ${project.package}`, countOf);
      return;
    }
    const buildCommand = project.buildCommand || "build";
    execa.sync("yarn", [buildCommand], { cwd: projectDir });
    logger.iterateInfo(`built ${project.package}`, countOf);
    return;
  }

  public linkSelf(projectDir: string, project: NodeProject, relink: boolean = false) {
    let cwd = projectDir;
    if (project.linkFrom) {
      cwd = path.join(projectDir, project.linkFrom);
    }
    if (relink) {
      execa.sync("yarn", ["unlink"], { cwd });
    }
    if (project.lerna) {
      return execa.sync("lerna", ["exec", "yarn", "link"], { cwd });
    }
    return execa.sync("yarn", ["link"], { cwd });
  }

  public linkDependencies(projectDir: string, project: NodeProject, countOf: number[]) {
    if (project.links) {
      if (project.lerna) {
        execa.sync("lerna", ["exec", "--", "yarn", "link", ...project.links], { cwd: projectDir });
      } else {
        execa.sync("yarn", ["link", ...project.links], { cwd: projectDir });
      }

      logger.iterateInfo(`linked dependencies for ${project.package}`, countOf);
      return;
    }
  }

  public linkTypes(projectDir: string, project: NodeProject) {
    const { baseDir, typeDefs } = this.config;
    if (project.types) {
      for (let type of project.types) {
        const typeSymbolicPath = path.join(projectDir, `node_modules/@types/${type}`);
        const typePath = path.join(baseDir, "@types", typeDefs[type].typesPath);
        rimraf.sync(typeSymbolicPath);
        fs.symlinkSync(typePath, typeSymbolicPath, "dir");
      }
    }
  }
  // default run command
  public run() {
    logger.error(`Command ${process.argv[2]} does not exist. Try setup, relink, or rebuild `);
  }
}
