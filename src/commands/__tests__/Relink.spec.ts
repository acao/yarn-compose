import { Relink } from '../Relink'
import * as rimraf from 'rimraf'
import * as lib from '../../lib'
import { CommandInstanceOptions } from '../../types';

jest.mock('../../lib')

const CONFIG_PATH = __dirname + '/../../__tests__/fixtures/projects.yml'

const BUILD_DIR = '/tmp/yarn-compose'

describe('Setup', () => {
  afterEach(() => {
    rimraf.sync(BUILD_DIR)
  })
  it('should instantiate and call lib functions', () => {
    const config: CommandInstanceOptions = {
      configPath: CONFIG_PATH
    }
    new Relink(config).run()
    expect(lib.linkSelf).toBeCalledTimes(6)
    expect(lib.linkDependencies).toBeCalledTimes(5)
    expect(lib.linkTypes).toBeCalledTimes(2)
  })
})
