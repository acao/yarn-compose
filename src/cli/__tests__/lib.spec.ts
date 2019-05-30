import { runCLI } from '../lib'
import * as rimraf from 'rimraf'

import * as util from '../util'

const BUILD_DIR = '/home/travis/example'

jest.mock('../util')

jest.spyOn(util.commandMap.setup, 'constructor')
jest.mock('execa')

describe('runCLI', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('runs the CLI interface', () => {
    rimraf.sync(BUILD_DIR)
    const argv = [
      '',
      '',
      'setup',
      '-c',
      __dirname + '/../../__tests__/fixtures/projects.yml',
      '-t',
      BUILD_DIR,
    ]
    runCLI(argv)
    expect(util.getMeowConfig).toBeCalledTimes(1)
    expect(util.getMeowConfig).toBeCalledWith(argv)
    expect(util.commandMap.setup).toBeCalledTimes(1)
  })

  it('show command help', () => {
    rimraf.sync(BUILD_DIR)
    const argv = ['', '', 'setup', '--help']
    runCLI(argv)
    expect(util.getMeowConfig).toBeCalledTimes(1)
    expect(util.getMeowConfig).toBeCalledWith(argv)
  })
})
