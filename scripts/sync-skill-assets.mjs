import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundles = [
  {
    source: join(root, "src"),
    destination: join(root, "skills/install-anti-slop/assets/anti-slop"),
    include: (path) => !path.endsWith(".test.ts"),
  },
  {
    source: join(root, "vendor/oxlint-plugin-jev"),
    destination: join(root, "skills/install-anti-slop/assets/oxlint-plugin-jev"),
    include: () => true,
  },
];
const check = process.argv.includes("--check");

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return files(path);
    // License and provenance files are part of the shipped distribution too.
    return [path];
  });
}

for (const { source, destination, include } of bundles) {
  const from = relative(root, source);
  const name = relative(root, destination);
  if (check) {
    const expected = files(source).filter(include).map((path) => relative(source, path)).sort();
    const actual = existsSync(destination)
      ? files(destination).map((path) => relative(destination, path)).sort()
      : [];
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      throw new Error(`${name} differs from ${from}; run \`pnpm sync:skill-assets\`.`);
    }
    for (const path of expected) {
      if (!readFileSync(join(source, path)).equals(readFileSync(join(destination, path)))) {
        throw new Error(`${name}/${path} differs from ${from}; run \`pnpm sync:skill-assets\`.`);
      }
    }
    console.log(`${name} matches ${from}.`);
  } else {
    rmSync(destination, { recursive: true, force: true });
    mkdirSync(destination, { recursive: true });
    cpSync(source, destination, { recursive: true, filter: include });
    console.log(`Synced ${name}.`);
  }
}
