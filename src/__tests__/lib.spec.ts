import * as execa from 'execa'
import * as mkdirp from 'mkdirp'
import * as rimraf from 'rimraf'
import * as path from 'path'
jest.mock('execa')

import {
  cloneProject,
  checkoutBranch,
  installDependencies,
  buildProject,
  linkSelf,
  linkDependencies,
  cloneTypeDefinition,
  cloneTypeDefinitions,
  linkTypes,
} from '../lib'

import { NodeProject } from '../types'

const project: NodeProject = {
  package: 'example',
  branch: 'master',
  remote: 'git@github.com:example/example.git',
  links: ['another-example', 'another-example-1'],
  lerna: false,
  types: ['example-type'],
  npmClient: 'yarn',
  buildScript: 'build',
}

const lernaProject: NodeProject = {
  package: 'lerna-example',
  branch: 'master',
  remote: 'git@github.com:example/lerna-example.git',
  lerna: true,
  links: ['another-example', 'another-example-1'],
  npmClient: 'yarn',
  buildScript: 'build',
}

const DIR = '/tmp/example'

describe('cloneProject', () => {
  afterEach(() => {
    jest.clearAllMocks()
    rimraf.sync(DIR)
  })

  it('should clone a project', () => {
    cloneProject('https://github.com/acao/yarn-compose', DIR)
    expect(execa.sync).toHaveBeenCalledWith('git', [
      'clone',
      'https://github.com/acao/yarn-compose',
      DIR,
    ])
  })

  it('should not clone a project when it already exists', () => {
    mkdirp.sync('/tmp/example/.git')
    cloneProject('https://github.com/acao/yarn-compose', DIR)
    expect(execa.sync).toHaveBeenCalledTimes(0)
  })
})

describe('checkoutBranch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    rimraf.sync(DIR)
  })

  it('should checkout a branch in an existing repo', () => {
    mkdirp.sync(DIR + '/.git')
    checkoutBranch(DIR, 'd7674130d80c9396c8195101c69596a217c7cad9')
    expect(execa.sync).toHaveBeenLastCalledWith(
      'git',
      ['checkout', 'd7674130d80c9396c8195101c69596a217c7cad9'],
      {
        cwd: DIR,
      }
    )
  })

  it('should fail when a repository doesnt exist', () => {
    expect(() =>
      checkoutBranch(DIR, 'd7674130d80c9396c8195101c69596a217c7cad9')
    ).toThrowError(
      'Cannot checkout d7674130d80c9396c8195101c69596a217c7cad9, /tmp/example is not a git repository'
    )
  })
})

describe('installDependencies', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should install packages for a normal repository', () => {
    installDependencies(DIR, project, { countOf: [1, 1] })
    expect(execa.sync).toHaveBeenLastCalledWith(
      'yarn',
      ['install', '--ignore-scripts'],
      { cwd: DIR }
    )
  })

  it('should install packages with --force flag', () => {
    installDependencies(DIR, lernaProject, { countOf: [1, 1], force: true })
    expect(execa.sync).toHaveBeenLastCalledWith(
      'yarn',
      ['install', '--ignore-scripts', '--force'],
      {
        cwd: DIR,
      }
    )
  })
})

describe('buildProject', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should build project for a normal repository', () => {
    buildProject(DIR, project, { countOf: [1, 1] })
    expect(execa.sync).toHaveBeenLastCalledWith('yarn', ['build'], { cwd: DIR })
  })

  it('should build project for a lerna repository', () => {
    buildProject(DIR, lernaProject, { countOf: [1, 1] })
    expect(execa.sync).toHaveBeenLastCalledWith('lerna', ['run', 'build'], {
      cwd: DIR,
    })
  })
})

describe('linkSelf', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should link normal project', () => {
    linkSelf(DIR, project, { countOf: [1, 1] })
    expect(execa.sync).toHaveBeenCalledWith('yarn', ['unlink'], { cwd: DIR })
    expect(execa.sync).toHaveBeenLastCalledWith('yarn', ['link'], { cwd: DIR })
  })

  it('should link all projects in a lerna repository', () => {
    linkSelf(DIR, lernaProject, { countOf: [1, 1] })
    expect(execa.sync).toHaveBeenCalledWith(
      'lerna',
      ['exec', 'yarn', 'unlink'],
      {
        cwd: DIR,
      }
    )
    expect(execa.sync).toHaveBeenLastCalledWith(
      'lerna',
      ['exec', 'yarn', 'link'],
      {
        cwd: DIR,
      }
    )
  })

  it('should build project and honor opts.project.linkFrom', () => {
    linkSelf(DIR, { ...project, linkFrom: 'path' }, { countOf: [1, 1] })
    expect(execa.sync).toHaveBeenLastCalledWith('yarn', ['link'], {
      cwd: DIR + '/path',
    })
  })
})

describe('linkDependencies', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should link dependencies for a normal repository', () => {
    linkDependencies(DIR, project, { countOf: [1, 1] })
    expect(execa.sync).toHaveBeenLastCalledWith(
      'yarn',
      ['link', 'another-example', 'another-example-1'],
      { cwd: DIR }
    )
  })

  it('should link dependencies for a lerna repository', () => {
    linkDependencies(DIR, lernaProject, { countOf: [1, 1] })
    expect(execa.sync).toHaveBeenLastCalledWith(
      'lerna',
      ['exec', '--', 'yarn', 'link', 'another-example', 'another-example-1'],
      {
        cwd: DIR,
      }
    )
  })
  it('should do nothing if there are no links', () => {
    linkDependencies(DIR, { ...project, links: undefined }, { countOf: [1, 1] })
    expect(execa.sync).toHaveBeenCalledTimes(0)
  })
})

describe('cloneTypeDefinition', () => {
  afterEach(() => {
    jest.clearAllMocks()
    rimraf.sync(DIR)
  })

  it('should clone the type repo', () => {
    cloneTypeDefinition(DIR, 'example-type', {
      branch: 'master',
      remote: 'git://',
      typesPath: 'types',
      depth: 1,
    })
    expect(execa.sync).toHaveBeenCalledWith('git', [
      'clone',
      'git://',
      '/tmp/example/@types/example-type',
      '--branch',
      'master',
      '--depth',
      '1',
    ])
  })

  it('should clone the type repo with depth', () => {
    cloneTypeDefinition(DIR, 'example-type', {
      branch: 'master',
      remote: 'git://',
      typesPath: 'types',
      depth: 3,
    })
    expect(execa.sync).toHaveBeenCalledWith('git', [
      'clone',
      'git://',
      '/tmp/example/@types/example-type',
      '--branch',
      'master',
      '--depth',
      '3',
    ])
  })

  it('should checkout a different branch if it already exists', () => {
    mkdirp.sync('/tmp/example/@types/example-type/.git')
    cloneTypeDefinition(DIR, 'example-type', {
      branch: 'master',
      remote: 'git://',
      typesPath: 'types',
      depth: 3,
    })
    expect(execa.sync).toHaveBeenCalledWith('git', ['checkout', 'master'], {
      cwd: '/tmp/example/@types/example-type',
    })
  })
})

describe('cloneTypeDefinitions', () => {
  afterEach(() => {
    jest.clearAllMocks()
    rimraf.sync(DIR)
  })

  it('should clone the type repo', () => {
    cloneTypeDefinitions(DIR, {
      'example-type': {
        branch: 'master',
        remote: 'git://',
        typesPath: 'types',
        depth: 1,
      },
    })
    expect(execa.sync).toHaveBeenCalledWith('git', [
      'clone',
      'git://',
      '/tmp/example/@types/example-type',
      '--branch',
      'master',
      '--depth',
      '1',
    ])
  })
})

describe('linkTypes', () => {
  afterEach(() => {
    jest.clearAllMocks()
    rimraf.sync(DIR)
  })
  it('should link directories', () => {
    mkdirp.sync(path.join(DIR, 'example/@types/example-type'))
    mkdirp.sync(path.join(DIR, 'example/node_modules/@types'))
    linkTypes(
      path.join(DIR, 'example'),
      project,
      {
        baseDir: DIR,
        projects: [project],
        typeDefs: {
          'example-type': {
            branch: 'master',
            remote: 'git://',
            typesPath: 'example-type',
            depth: 1,
          },
        },
      }
    )
  })
})
