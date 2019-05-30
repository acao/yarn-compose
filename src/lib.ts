import * as execa from 'execa'
import * as fs from 'fs'
import * as rimraf from 'rimraf'
import * as path from 'path'
import * as mkdirp from 'mkdirp'
import { logger, repoExists } from './util'

import { NodeProject, CommandConfig, TypeDef, TaskOptions, Map } from './types'

export function installDependencies(
  projectDir: string,
  project: NodeProject,
  opts: TaskOptions
) {
  const args = ['install', '--ignore-scripts']
  if (opts.force) {
    args.push('--force')
  }

  execa.sync(project.npmClient, args, { cwd: projectDir })
  logger.iterateInfo(
    `installed dependencies for ${project.package}`,
    opts.countOf
  )
}

export function buildProject(
  projectDir: string,
  project: NodeProject,
  opts: TaskOptions
) {
  if (project.lerna) {
    execa.sync('lerna', ['run', 'build'], { cwd: projectDir })
    logger.iterateInfo(`built ${project.package}`, opts.countOf)
    return
  }
  execa.sync(project.npmClient, [project.buildScript], { cwd: projectDir })
  logger.iterateInfo(`built ${project.package}`, opts.countOf)
  return
}

export function linkSelf(
  projectDir: string,
  project: NodeProject,
  opts: TaskOptions
) {
  let cwd = projectDir
  if (project.linkFrom) {
    cwd = path.join(projectDir, project.linkFrom)
  }
  try {
    if (!project.lerna) {
      execa.sync(project.npmClient, ['unlink'], { cwd })
      logger.iterateInfo(`unlinking ${project.package}`, opts.countOf)
    } else {
      execa.sync('lerna', ['exec', project.npmClient, 'unlink'], { cwd })
      logger.iterateInfo(
        `unlinking subpackages in ${project.package}`,
        opts.countOf
      )
    }
  } catch (err) {
    logger.warn(
      `No registered package found for "${project.package}" yet. Linking now...`
    )
  }
  if (!project.lerna) {
    execa.sync(project.npmClient, ['link'], { cwd })
    logger.iterateInfo(`linked ${project.package}`, opts.countOf)
  } else {
    execa.sync('lerna', ['exec', project.npmClient, 'link'], { cwd })
    logger.iterateInfo(`linked subpackges in ${project.package}`, opts.countOf)
  }

  return
}

export function linkDependencies(
  projectDir: string,
  project: NodeProject,
  opts: TaskOptions
) {
  if (project.links) {
    if (project.lerna) {
      execa.sync(
        'lerna',
        ['exec', '--', project.npmClient, 'link', ...project.links],
        {
          cwd: projectDir,
        }
      )
      logger.iterateInfo(
        `linked subpackage dependencies in ${project.package}`,
        opts.countOf
      )
    } else {
      execa.sync(project.npmClient, ['link', ...project.links], {
        cwd: projectDir,
      })
      logger.iterateInfo(
        `linked dependencies of ${project.package}`,
        opts.countOf
      )
    }

    return
  }
}

export function cloneTypeDefinitions(baseDir: string, typeDefs: Map<TypeDef>) {
  for (let [typeDefName, typeInfo] of Object.entries(typeDefs)) {
    cloneTypeDefinition(baseDir, typeDefName, typeInfo)
  }
}

export function cloneTypeDefinition(
  baseDir: string,
  typeDefName: string,
  typeInfo: TypeDef
) {
  const typeDefPath = path.join(baseDir, '@types', typeDefName)
  if (!fs.existsSync(typeDefName)) {
    mkdirp.sync(typeDefName)
  }
  if (repoExists(typeDefPath)) {
    logger.warn(`Type repository for ${typeDefName} is present`)
    checkoutBranch(typeDefPath, typeInfo.branch)
    return
  }
  logger.warn('setting up typeDefs, this could take a while...')
  execa.sync(
    'git',
    [
      'clone',
      typeInfo.remote,
      typeDefPath,
      '--branch',
      typeInfo.branch,
      '--depth',
      typeInfo.depth.toString(),
    ]
  )
  return logger.info(`cloned typeDefinition for ${typeDefName}`)
}

export function linkType(
  type: string,
  projectDir: string,
  baseDir: string,
  typeDef: TypeDef
) {
  const typeSymbolicPath = path.join(projectDir, `node_modules/@types/${type}`)
  const typePath = path.join(baseDir, '@types', typeDef.typesPath)
  rimraf.sync(typeSymbolicPath)
  fs.symlinkSync(typePath, typeSymbolicPath, 'dir')
}

export function linkTypes(
  projectDir: string,
  project: NodeProject,
  config: CommandConfig
) {
  const { baseDir, typeDefs } = config
  if (project.types) {
    for (let type of project.types) {
      linkType(type, projectDir, baseDir, typeDefs[type])
    }
  }
}

export function cloneProject(remote: string, projectDir: string) {
  if (!repoExists(projectDir)) {
    return execa.sync('git', ['clone', remote, projectDir])
  }
  return
}

export function checkoutBranch(projectDir: string, branch: string) {
  if (!repoExists(projectDir)) {
    throw Error(
      `Cannot checkout ${branch}, ${projectDir} is not a git repository`
    )
  }
  return execa.sync('git', ['checkout', branch], { cwd: projectDir })
}

export function cloneAndInstall(
  projectDir: string,
  project: NodeProject,
  opts: TaskOptions
) {
  cloneProject(project.remote, projectDir)
  checkoutBranch(projectDir, project.branch)
  logger.iterateInfo(
    `cloned and checked out ${project.package}#${project.branch}`,
    opts.countOf
  )
  installDependencies(projectDir, project, opts)
}
