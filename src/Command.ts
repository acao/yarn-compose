import * as path from 'path'
import * as fs from 'fs'

import * as Ajv from 'ajv'

import { logger, getConfig } from './util'
import { CommandConfig, NodeProject, CommandInstanceOptions } from './types'
import { configSchema } from './schema'

export interface EachProjectOptions {
  filter?: (value: NodeProject) => boolean
}
export class Command {
  options: CommandInstanceOptions
  config: CommandConfig
  configPath: string
  baseDir: string

  constructor(options: CommandInstanceOptions) {
    this.options = options
    this.configPath =
      options.configPath || path.join(process.cwd(), 'projects.yml')
    this.config = this.getCommandConfig()
    this.baseDir = this.config.baseDir = options.baseDir || options.targetDir || this.config.baseDir
  }

  public eachProject(fn: Function, options: EachProjectOptions = {}) {
    let value = 0
    const { projects } = this.config
    const filteredProjects = options.filter
      ? projects.filter(options.filter)
      : projects

    for (const project of filteredProjects) {
      value++
      const projectDir = path.join(this.baseDir, project.package)
      fn(projectDir, project, {
        ...this.options,
        countOf: [value, filteredProjects.length],
      })
    }
  }

  private getCommandConfig(): CommandConfig {
    if (!fs.existsSync(this.configPath)) {
      throw Error(
        `config file doesnt exist:\n ${
          this.configPath
        }.\n\nPlease use -c or --config-path to specify a path to a config file, or create one.`
      )
    }
    const config = getConfig(this.configPath)
    return this.validateConfig(config)
  }

  private validateConfig(config: CommandConfig) {
    const ajv = new Ajv({ useDefaults: true })
    const ajvValidator = ajv.compile(configSchema)
    const valid = ajvValidator(config)
    if (!valid) {
      logger.error(JSON.stringify(ajvValidator.errors, null, 2))
      throw Error(`Invalid configuration file:`)
    }
    // return the config with defaults added
    return config
  }
}
