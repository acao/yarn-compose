import execa from "execa";
import * as path from "path";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as rimraf from "rimraf";
import { getConfig, getLogger } from "./util";

interface Map<T> {
  [K: string]: T;
}

interface NodeProject {
  branch: string;
  package: string;
  remote: string;
  lerna?: boolean;
  links?: string[];
  types?: string[];
  linkFrom: string;
}

interface TypeDef {
  branch: string;
  remote: string;
  source: string;
  typeName: string;
}
const logger = getLogger();
const configPath = process.argv[2] || path.join(process.cwd(), "projects.yml");

if (!fs.existsSync(configPath)) {
  logger.error(`config path doesnt exist:\n ${configPath}`);
  process.exit(1);
}

const { baseDir, projects, typedefs = null } = getConfig(configPath);

const typeDefs: Map<TypeDef> = typedefs;

async function setup() {
  const cwd = path.join(process.cwd(), baseDir);
  let isGitRepo = true;
  try {
    await execa("git", ["status"], { cwd });
  } catch (err) {
    isGitRepo = false;
  }
  if (isGitRepo) {
    logger.error(`cannot intialize in a git repository`);
    process.exit(1);
    return;
  }
  if (!fs.existsSync(cwd)) {
    logger.warn(`creating working directory`);
    await mkdirp.sync(baseDir);
  }
}

async function cloneProject(remote: string, projectDir: string) {
  if (!fs.existsSync(projectDir)) {
    return execa("git", ["clone", remote, projectDir]);
  }
  logger.warn(`${projectDir} already exists`);
}

async function cloneTypeDefinitions() {
  for await (let [typeDefName, typeInfo] of Object.entries(typeDefs)) {
    const typeDefPath = path.join(process.cwd(), baseDir, "@types", typeDefName);
    if (!fs.existsSync(typeDefPath)) {
      await mkdirp.sync(typeDefPath);
    }
    if (fs.existsSync(path.join(typeDefPath, ".git"))) {
      return;
    }
    await execa("git", ["init"], { cwd: typeDefPath });
    await mkdirp.sync(path.join(typeDefPath, ".git/info"));
    await execa("git", ["remote", "add", "-f", "origin", typeInfo.remote], { cwd: typeDefPath });
    await execa("git", ["config", "core.sparseCheckout", "true"], { cwd: typeDefPath });
    await fs.writeFileSync(path.join(typeDefPath, ".git/info/sparse-checkout"), `types/${typeInfo.typeName}`, "utf8");
    await execa("git", ["checkout", typeInfo.branch], { cwd: typeDefPath });
  }
}

async function checkoutBranch(projectDir: string, branch: string) {
  return execa("git", ["checkout", branch], { cwd: projectDir });
}

async function each(fn: Function) {
  for await (const project of projects) {
    const projectDir = path.join(process.cwd(), baseDir, project.package);
    await fn(projectDir, project);
  }
}

async function setupGitRepos(projectDir: string, project: NodeProject) {
  await cloneProject(project.remote, projectDir);
  await checkoutBranch(projectDir, project.branch);
  logger.info(`cloned and checked out ${project.package}#${project.branch}`);
}

async function installDependencies(projectDir: string, project: NodeProject) {
  await execa("yarn", ["install", "--ignore-scripts"], { cwd: projectDir });
  logger.info(`installed dependencies for ${project.package}`);
}

async function buildProject(projectDir: string, project: NodeProject) {
  if (project.lerna) {
    logger.info(`built ${project.package}`);
    return execa("lerna", ["run", "build"], { cwd: projectDir });
  }
  logger.info(`built ${project.package}`);
  return execa("yarn", ["build"], { cwd: projectDir });
}

async function linkSelf(projectDir: string, project: NodeProject, relink: boolean = false) {
  let cwd = projectDir;
  if (project.linkFrom) {
    cwd = path.join(projectDir, project.linkFrom);
  }
  if (relink) {
    await execa("yarn", ["unlink"], { cwd });
  }
  if (project.lerna) {
    return execa("lerna", ["exec", "yarn", "link"], { cwd });
  }
  return execa("yarn", ["link"], { cwd });
}

async function linkDependencies(projectDir: string, project: NodeProject) {
  if (project.links) {
    if (project.lerna) {
      await execa("lerna", ["exec", "--", "yarn", "link", ...project.links], { cwd: projectDir });
    } else {
      await execa("yarn", ["link", ...project.links], { cwd: projectDir });
    }

    logger.info(`linked dependencies for ${project.package}`);
    return;
  }
}

async function linkTypes(projectDir: string, project: NodeProject) {
  if (project.types) {
    for (let type of project.types) {
      const typeSymbolicPath = path.join(projectDir, `node_modules/@types/${type}`);
      const typePath = path.join(process.cwd(), baseDir, "@types", type, "types", typeDefs[type].typeName);
      rimraf.sync(typeSymbolicPath);
      return fs.symlinkSync(typePath, typeSymbolicPath, "dir");
    }
  }
}

async function setupProject(projectDir: string, project: NodeProject) {
  await installDependencies(projectDir, project);
  if (project.types) {
    await linkTypes(projectDir, project);
  }
  await linkDependencies(projectDir, project);
  await buildProject(projectDir, project);
  await linkSelf(projectDir, project);
}

(async () => {
  try {
    await setup();
    await each(setupGitRepos);
    logger.warn("setting up typeDefs, this could take a while... and a lot of bandwith...");
    await cloneTypeDefinitions();
    logger.info("type defs setup");
    await each(setupProject);
  } catch (err) {
    logger.error(err);
  }
})();
