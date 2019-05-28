import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from 'path'
import chalk from "chalk";
import * as getPkgInfo from "pkginfo";

const pkginfo = getPkgInfo(module);

const LOG_PREFIX = "yarn-compose";

export function getConfig(configPath: string) {
  return yaml.safeLoad(fs.readFileSync(configPath, "utf8"));
}

export function repoExists(projectPath: string) {
  return fs.existsSync(path.join(projectPath, '.git'))
}

const log = console.log;
export const logger = {
  meta: (msg: string) => log(chalk.whiteBright.bold(`${LOG_PREFIX} ${msg} v${pkginfo.version}\n`)),
  success: (msg: string) => log(`${chalk.green.bold("success")} ${msg}`),
  info: (msg: string) => log(`${chalk.green.bold("success")} ${msg}`),
  iterateInfo: (msg: string, countOf: number[]) =>
    log(`${chalk.grey(`[${countOf[0]}/${countOf[1]}]`)} ${chalk.green.bold("success")} ${msg}`),
  warn: (msg: string) => log(`${chalk.yellow("warn")} ${msg}`),
  error: (msg: any) => log(`${chalk.red("error")} ${msg}`),
  help: (msg: string) => log(msg)
};
