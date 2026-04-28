import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

for (const filename of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) continue;

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  }
}
