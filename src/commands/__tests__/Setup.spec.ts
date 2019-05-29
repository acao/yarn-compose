import { Setup } from '../Setup'
import * as execa from 'execa'
import * as rimraf from 'rimraf'
import * as meow from 'meow'
import * as lib from '../../lib'
import * as mkdirp from 'mkdirp'

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
    new Setup(meowMock).run()
    expect(lib.buildProject).toBeCalledTimes(6)
    expect(lib.cloneAndInstall).toBeCalledTimes(6)
    expect(lib.linkSelf).toBeCalledTimes(6)
    expect(lib.linkDependencies).toBeCalledTimes(6)
    expect(lib.linkTypes).toBeCalledTimes(2)
  })

  it('should throw when you attempt to use an existing git repo', () => {
    mkdirp.sync(BUILD_DIR)
    execa.sync('git', ['init', '.'], { cwd: BUILD_DIR })
    const meowMock: meow.Result = {
      flags: { configPath: CONFIG_PATH },
      ...meowDefaults,
    }
    expect(() => new Setup(meowMock).run()).toThrow(
      'cannot intialize in a git repository'
    )
  })
})
