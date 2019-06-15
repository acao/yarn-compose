import { logger } from "../util";

try {
  require('./lib').runCLI(process.argv)
} catch (err) {
  logger.error(err)
  process.exit(1)
}
