export interface Map<T> {
  [K: string]: T
}
declare module 'pkginfo'


export interface NodeProject {
  branch: string
  package: string
  remote: string
  buildScript: string
  lerna: boolean
  npmClient: 'npm' | 'yarn' | 'cnpm'
  links?: string[]
  types?: string[]
  linkFrom?: string
}

export interface TypeDef {
  branch: string
  remote: string
  typesPath: string
  depth: number
}

export interface TaskOptions {
  countOf: number[]
  force?: boolean
}

export interface CommandConfig {
  baseDir: string
  typeDefs: Map<TypeDef>
  projects: NodeProject[]
}
