import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "src");
const destination = join(root, "skills/install-anti-slop/assets/anti-slop");
const check = process.argv.includes("--check");

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return files(path);
    if (entry.name.endsWith(".test.ts")) return [];
    // License and provenance files are part of the shipped distribution too.
    return [path];
  });
}

if (check) {
  const expected = files(source).map((path) => relative(source, path)).sort();
  const actual = existsSync(destination)
    ? files(destination).map((path) => relative(destination, path)).sort()
    : [];
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error("Skill assets differ from src; run `pnpm sync:skill-assets`.");
  }
  for (const path of expected) {
    if (readFileSync(join(source, path), "utf8") !== readFileSync(join(destination, path), "utf8")) {
      throw new Error(`${path} differs from its skill asset; run \`pnpm sync:skill-assets\`.`);
    }
  }
  console.log("Skill assets match src.");
} else {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, {
    recursive: true,
    filter: (path) => !path.endsWith(".test.ts"),
  });
  console.log(`Synced ${relative(root, destination)}.`);
}
