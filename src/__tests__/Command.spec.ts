import { Command } from '../Command'
import { expect } from 'chai'
import * as rimraf from 'rimraf'
import { CommandInstanceOptions } from '../types'

describe('Command', () => {
  afterEach(() => {
    rimraf.sync('/tmp/yarn-compose')
  })
  it('should instantiate with expected variables', () => {
    const options: CommandInstanceOptions = {
      configPath: __dirname + '/fixtures/projects.yml',
    }
    const command = new Command(options)
    expect(command.options).to.deep.equal(options)
    expect(command.configPath).to.equal(__dirname + '/fixtures/projects.yml')
  })

  it('should override base dir with CLI args', () => {
    const options: CommandInstanceOptions = {
      configPath: __dirname + '/fixtures/projects.yml',
      baseDir: '/tmp/new-path',
    }
    const command = new Command(options)
    expect(command.config.baseDir).to.equal('/tmp/new-path')
    rimraf.sync('/tmp/new-path')
  })

  it('should use default configPath when config-path is missing from cli args', () => {
    const options: CommandInstanceOptions = {}
    expect(() => new Command(options)).to.throw()
  })

  it('should throw on invalid config file', () => {
    const options: CommandInstanceOptions = {
      configPath: __dirname + '/fixtures/projects-invalid.yml',
    }
    expect(() => new Command(options)).to.throw()
  })

  it('should execute commands and pass arguments for eachProject', () => {
    const options: CommandInstanceOptions = {
      configPath: __dirname + '/fixtures/projects.yml',
    }
    const eachProjectStub = jest.fn()
    const command = new Command(options)
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
        lerna: false,
      },
      {
        configPath: __dirname + '/fixtures/projects.yml',
        countOf: [1, 6],
      },
    ])
  })
})
