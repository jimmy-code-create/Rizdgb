import { execSync } from "child_process";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

try {
  logger.info("Running database migrations...");
  execSync("npx drizzle-kit push", {
    stdio: "inherit",
    env: { ...process.env },
  });
  logger.info("Database migrations complete");
} catch (err) {
  logger.error({ err }, "Migration failed — exiting");
  process.exit(1);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});