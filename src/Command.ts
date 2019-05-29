import * as path from "path";
import * as fs from "fs";

import * as Ajv from "ajv";
import * as meow from "meow";

import { logger, getConfig } from "./util";
import { CommandConfig, NodeProject } from "./types";
import { configSchema } from "./schema";

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

const ajvValidator = ajv.compile(configSchema);

export interface EachProjectOptions {
  filter?: (value: NodeProject) => boolean;
}
export class Command {
  args: any;
  input: string[];
  config: CommandConfig;
  configPath: string;

  constructor(args: meow.Result) {
    this.input = args.input;
    this.args = args.flags;
    this.configPath = args.flags.configPath || path.join(process.cwd(), "projects.yml");
    this.config = this.getCommandConfig();
    this.config.baseDir = args.flags.baseDir || this.config.baseDir;
  }

  public eachProject(fn: Function, options: EachProjectOptions = {}) {
    let value = 0;
    const { projects, baseDir } = this.config;
    const filteredProjects = options.filter ? projects.filter(options.filter) : projects;

    for (const project of filteredProjects) {
      value++;
      const projectDir = path.join(baseDir, project.package);
      fn(projectDir, project, { ...this.args, countOf: [value, filteredProjects.length] });
    }
  }

  private getCommandConfig(): CommandConfig {
    if (!fs.existsSync(this.configPath)) {
      throw Error(`config file doesnt exist:\n ${this.configPath}.\n\nPlease use -c or --config-path to specify a path to a config file, or create one.`);
    }
    const config = getConfig(this.configPath);
    this.validateConfig(config);
    return config;
  }

  private validateConfig(config: CommandConfig) {
    const valid = ajvValidator(config);
    if (!valid) {
      logger.error(JSON.stringify(ajvValidator.errors, null, 2));
      throw Error(`Invalid configuration file:`);
    }
    return valid;
  }
}
