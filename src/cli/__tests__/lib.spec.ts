import { runCLI } from '../lib'
import * as rimraf from 'rimraf'
import * as util from '../util'

const BUILD_DIR = '/home/travis/example'

jest.mock('../util')

jest.spyOn(util.commandMap.setup, 'constructor')
jest.mock('execa')

describe('runCLI', () => {
  beforeEach(() => {
    rimraf.sync(BUILD_DIR)
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('runs the CLI interface', () => {
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

  it('shows command help when passing --help', () => {
    const argv = ['', '', 'setup', '--help']
    runCLI(argv)
    expect(util.getMeowConfig).toBeCalledTimes(1)
    expect(util.getMeowConfig).toBeCalledWith(argv)
  })

  it('shows help on invalid command', () => {
    const argv = ['', '', 'invalid']
    expect(() => runCLI(argv)).toThrowError()
    expect(util.getMeowConfig).toBeCalledTimes(0)
    expect(util.listAvailableCommands).toBeCalledTimes(1)
  })

  it('shows help on missing command', () => {
    const argv = ['', '']
    expect(() => runCLI(argv)).toThrowError()
    expect(util.getMeowConfig).toBeCalledTimes(0)
    expect(util.listAvailableCommands).toBeCalledTimes(1)
  })
})
