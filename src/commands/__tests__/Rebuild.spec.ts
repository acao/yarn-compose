import { Rebuild } from '../Rebuild'
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
    const options: CommandInstanceOptions = {
      configPath: CONFIG_PATH
    }
    new Rebuild(options).run()
    expect(lib.buildProject).toBeCalledTimes(6)
  })
})
