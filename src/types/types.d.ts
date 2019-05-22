export interface Map<T> {
  [K: string]: T;
}
declare module "pkginfo";

export interface NodeProject {
  branch: string;
  package: string;
  remote: string;
  lerna?: boolean;
  links?: string[];
  types?: string[];
  buildCommand?: string;
  linkFrom?: string;
}

export interface TypeDef {
  branch: string;
  remote: string;
  typeName: string;
}

export interface CommandConfig {
  baseDir: string;
  typeDefs: Map<TypeDef>;
  projects: NodeProject[];
}
