// Shared by the operator scripts: reads .env.local without printing it.
import { readFileSync } from "node:fs";

export function loadEnvLocal() {
  const env = {};
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) env[match[1]] = match[2].trim().replace(/^"(.*)"$/, "$1");
  }
  return { ...env, ...process.env };
}

export function requireEnv(env, ...names) {
  const missing = names.filter((name) => !env[name]);
  if (missing.length) {
    console.error(`Missing in .env.local: ${missing.join(", ")}`);
    process.exit(1);
  }
}
