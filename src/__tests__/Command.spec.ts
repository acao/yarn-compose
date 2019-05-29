import { Command } from '../Command'
import { expect } from 'chai'
import * as rimraf from 'rimraf'
import * as meow from 'meow'

const meowDefaults = {
  input: ['none'],
  pkg: '',
  help: '',
  showHelp: () => {},
  showVersion: () => {},
}

describe('Command', () => {
  it('should instantiate with expected variables', () => {
    const meowMock: meow.Result = {
      flags: { configPath: __dirname + '/fixtures/projects.yml' },
      ...meowDefaults,
    }
    const command = new Command(meowMock)
    expect(command.input).to.deep.equal(['none'])
    expect(command.args).to.deep.equal(meowMock.flags)
    expect(command.configPath).to.equal(__dirname + '/fixtures/projects.yml')
    rimraf.sync('/tmp/yarn-compose')
  })

  it('should override base dir with CLI args', () => {
    const meowMock: meow.Result = {
      flags: {
        configPath: __dirname + '/fixtures/projects.yml',
        baseDir: '/tmp/new-path',
      },
      ...meowDefaults,
    }
    const command = new Command(meowMock)
    expect(command.config.baseDir).to.equal('/tmp/new-path')
    rimraf.sync('/tmp/new-path')
  })

  it('should use default configPath when config-path is missing from cli args', () => {
    const meowMock: meow.Result = {
      flags: {},
      ...meowDefaults,
    }
    expect(() => new Command(meowMock)).to.throw()
    rimraf.sync('/tmp/yarn-compose')
  })

  it('should throw on invalid config file', () => {
    const meowMock: meow.Result = {
      flags: {
        configPath: __dirname + '/fixtures/projects-invalid.yml',
      },
      ...meowDefaults,
    }
    expect(() => new Command(meowMock)).to.throw()
    rimraf.sync('/tmp/yarn-compose')
  })

  it('should execute commands and pass arguments for eachProject', () => {
    const meowMock: meow.Result = {
      flags: {
        configPath: __dirname + '/fixtures/projects.yml',
      },
      ...meowDefaults,
    }
    const eachProjectStub = jest.fn()
    const command = new Command(meowMock)
    command.eachProject(eachProjectStub)
    expect(eachProjectStub.mock.calls.length).to.equal(6)
    expect(eachProjectStub.mock.calls[0]).to.deep.equal([
      '/tmp/yarn-compose/graphql-js',
      {
        package: 'graphql-js',
        remote: 'https://github.com/tgriesser/graphql-js.git',
        branch: 'inputUnion',
        linkFrom: 'dist',
        buildScript: 'build',
        npmClient: 'yarn',
        lerna: false
      },
      {
        configPath: __dirname + '/fixtures/projects.yml',
        countOf: [1, 6],
      },
    ])
    rimraf.sync('/tmp/yarn-compose')
  })
})
