import { Setup } from '../Setup'
import * as rimraf from 'rimraf'
import * as meow from 'meow'

const CONFIG_PATH = __dirname + '/../../__tests__/fixtures/projects.yml'

const meowDefaults = {
  input: ['none'],
  pkg: '',
  help: '',
  showHelp: () => {},
  showVersion: () => {},
}

describe('Setup', () => {
  it('should instantiate with expected variables', () => {
    const meowMock: meow.Result = {
      flags: { configPath: CONFIG_PATH },
      ...meowDefaults,
    }
    new Setup(meowMock)
    rimraf.sync('/tmp/yarn-compose')
  })
})
