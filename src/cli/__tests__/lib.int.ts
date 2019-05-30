import { runCLI } from '../lib'
import rimraf = require('rimraf')

const BUILD_DIR = '/home/travis/example'
// just a gutcheck
describe('run', () => {
  it(
    'runs without failure',
    () => {
      rimraf.sync(BUILD_DIR)
      runCLI([
        '',
        '',
        'setup',
        '-c',
        __dirname + '/../../__tests__/fixtures/projects.yml',
        '-t',
        BUILD_DIR,
      ])
    },
    10 * 60 * 60
  )
})
