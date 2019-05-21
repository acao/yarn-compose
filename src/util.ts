import * as yaml from "js-yaml";
import * as fs from "fs";
import chalk from "chalk";

const LOG_PREFIX = "yarn-compose";

export function getConfig(configPath: string) {
  return yaml.safeLoad(fs.readFileSync(configPath, "utf8"));
}

export function getLogger() {
  return {
    meta: (msg: string) => console.log(`${chalk.white(LOG_PREFIX)} ${msg}\n`),
    info: (msg: string) => console.log(`${chalk.green("success")} ${msg}`),
    warn: (msg: string) => console.log(`${chalk.yellow("warn")} ${msg}`),
    error: (msg: string) => console.log(`${chalk.red("error")} ${msg}`)
  };
}
