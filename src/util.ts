import * as yaml from "js-yaml";
import * as fs from "fs";
import chalk from "chalk";
import * as getPkgInfo from "pkginfo";

const pkginfo = getPkgInfo(module);

const LOG_PREFIX = "yarn-compose";

export function getConfig(configPath: string) {
  return yaml.safeLoad(fs.readFileSync(configPath, "utf8"));
}

export const logger = {
  meta: (msg: string) => console.log(`${chalk.white(LOG_PREFIX)} ${pkginfo.version} ${msg}\n`),
  info: (msg: string) => console.log(`${chalk.green("success")} ${msg}`),
  warn: (msg: string) => console.log(`${chalk.yellow("warn")} ${msg}`),
  error: (msg: any) => console.log(`${chalk.red("error")} ${msg}`)
};
