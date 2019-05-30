import { Command } from '../Command'
import { CommandInstanceOptions } from '../types'

import { buildProject } from '../lib'

export class Rebuild extends Command {
  static commandName = 'rebuild'

  static commandHelp = `
re-builds dependencies
  `

  constructor(options: CommandInstanceOptions) {
    super(options)
  }

  public run() {
    super.eachProject(buildProject)
  }
}
