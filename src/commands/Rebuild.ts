import meow from 'meow'
import { Command } from '../Command'

import { buildProject } from '../lib'

export class Rebuild extends Command {
  static commandName = 'rebuild'

  static commandHelp = `
re-builds dependencies
  `

  constructor(args: meow.Result) {
    super(args)
  }

  public run() {
    super.eachProject(buildProject)
  }
}
