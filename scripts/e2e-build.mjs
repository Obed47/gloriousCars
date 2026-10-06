// Builds the production site against the end-to-end fake backend.
import { spawnSync } from "node:child_process";
import { E2E_ENV } from "./e2e-env.mjs";

const result = spawnSync("node_modules/.bin/next", ["build"], {
  stdio: "inherit",
  env: { ...process.env, ...E2E_ENV },
});
process.exit(result.status ?? 1);
