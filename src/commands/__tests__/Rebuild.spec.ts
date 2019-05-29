import { Rebuild } from '../Rebuild'
import * as rimraf from 'rimraf'
import * as meow from 'meow'
import * as lib from '../../lib'

jest.mock('../../lib')

const CONFIG_PATH = __dirname + '/../../__tests__/fixtures/projects.yml'

const BUILD_DIR = '/tmp/yarn-compose'

const meowDefaults = {
  input: ['none'],
  pkg: '',
  help: '',
  showHelp: () => {},
  showVersion: () => {},
}

describe('Setup', () => {
  afterEach(() => {
    rimraf.sync(BUILD_DIR)
  })
  it('should instantiate and call lib functions', () => {
    const meowMock: meow.Result = {
      flags: { configPath: CONFIG_PATH },
      ...meowDefaults,
    }
    new Rebuild(meowMock).run()
    expect(lib.buildProject).toBeCalledTimes(6)
  })
})
