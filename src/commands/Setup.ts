import * as execa from 'execa'
import * as meow from 'meow'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'

import { NodeProject, TaskOptions } from '../types'
import { Command } from '../Command'
import { logger } from '../util'

import {
  linkTypes,
  linkDependencies,
  buildProject,
  linkSelf,
  cloneTypeDefinitions,
  cloneAndInstall,
} from '../lib'

export class Setup extends Command {
  static commandName = 'setup'

  static commandHelp = `
sets up project workspace, clones and installs projects, type definitions,  dbuilds and links dependencies

Usage:
  $ yarn-compose setup
      expects projects.yml by default
  $ yarn-compose setup -c path/to/config.yml
      or, specify a path to a config file

Options:
  --force, -f
    force install
`

  static additionalArgs = {
    force: {
      name: 'force',
      alias: '-f',
      type: 'boolean',
    },
  }

  constructor(args: meow.Result) {
    super(args)
    this.setupProject = this.setupProject.bind(this)
  }

  private setupWorkingDirectory() {
    const cwd = path.join(this.config.baseDir)
    let isGitRepo = true
    try {
      execa.sync('git', ['status'], { cwd, preferLocal: false })
    } catch (err) {
      isGitRepo = false
    }
    if (isGitRepo) {
      throw Error(`cannot intialize in a git repository`)
    }
    if (!fs.existsSync(cwd)) {
      logger.warn(`creating working directory`)
      mkdirp.sync(this.config.baseDir)
    } else {
      logger.info(`setup at existing baseDir ${this.config.baseDir}`)
    }
  }

  private setupProject(
    projectDir: string,
    project: NodeProject,
    opts: TaskOptions
  ) {
    if (project.types) {
      linkTypes(projectDir, project, this.config)
    }
    linkDependencies(projectDir, project, opts)
    buildProject(projectDir, project, opts)
    linkSelf(projectDir, project, opts)
  }

  public run() {
    this.setupWorkingDirectory()
    cloneTypeDefinitions(this.config.baseDir, this.config.typeDefs),
      super.eachProject(cloneAndInstall)
    super.eachProject(this.setupProject)
  }
}
