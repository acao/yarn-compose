import { Setup, SetupInstanceOptions } from '../Setup'
import * as rimraf from 'rimraf'
import * as lib from '../../lib'
import * as execa from 'execa'

jest.mock('../../lib')

const CONFIG_PATH = __dirname + '/../../__tests__/fixtures/projects.yml'

const BUILD_DIR = '/tmp/yarn-compose'

const options: SetupInstanceOptions = {
  configPath: CONFIG_PATH,
}

describe('Setup', () => {
  afterEach(() => {
    rimraf.sync(BUILD_DIR)
  })
  it('should instantiate and call lib functions', () => {
    new Setup(options).run()
    expect(lib.buildProject).toBeCalledTimes(6)
    expect(lib.cloneAndInstall).toBeCalledTimes(6)
    expect(lib.linkSelf).toBeCalledTimes(6)
    expect(lib.linkDependencies).toBeCalledTimes(6)
    expect(lib.linkTypes).toBeCalledTimes(2)
  })

  it('should throw when you attempt to use an existing git repo', () => {
    execa.sync('git', ['init', BUILD_DIR])
    expect(() => new Setup(options).run()).toThrow(
      'cannot intialize in a git repository'
    )
  })
})
