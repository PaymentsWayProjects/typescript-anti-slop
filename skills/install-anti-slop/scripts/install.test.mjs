import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const installer = join(scriptDirectory, "install.mjs");
const assets = resolve(scriptDirectory, "../assets");

function installerWorkspace(t) {
  const directory = mkdtempSync(join(tmpdir(), "anti-slop-installer-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function runInstaller(directory, ...arguments_) {
  const result = spawnSync(process.execPath, [installer, ...arguments_], {
    cwd: directory,
    encoding: "utf8",
  });
  assert.equal(result.error, undefined);
  return result;
}

// Compare the real bundled distribution, including every nested license/provenance file.
function assertCopiedBundle(source, destination) {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) {
      assertCopiedBundle(from, to);
    } else {
      assert.deepEqual(readFileSync(to), readFileSync(from), `Copied bytes differ: ${to}`);
    }
  }
}

function assertCopiedJev(destination) {
  for (const path of ["LICENSE", "UPSTREAM.md", "dist/index.mjs"]) {
    assert.ok(existsSync(join(destination, path)), `Missing Jev distribution file: ${path}`);
  }
  assertCopiedBundle(join(assets, "oxlint-plugin-jev"), destination);
}

test("default install copies anti-slop without opting into Jev", (t) => {
  const directory = installerWorkspace(t);
  const result = runInstaller(directory);
  assert.equal(result.status, 0, result.stderr);
  assertCopiedBundle(join(assets, "anti-slop"), join(directory, "tools/oxlint/anti-slop"));
  assert.equal(existsSync(join(directory, "tools/oxlint/oxlint-plugin-jev")), false);
});

test("--jev copies both real bundles beside a custom main destination", (t) => {
  const directory = installerWorkspace(t);
  const result = runInstaller(directory, "tooling/anti-slop", "--jev");
  assert.equal(result.status, 0, result.stderr);
  assertCopiedBundle(join(assets, "anti-slop"), join(directory, "tooling/anti-slop"));
  assertCopiedJev(join(directory, "tooling/oxlint-plugin-jev"));
});

test("--jev=destination copies Jev to the explicit destination", (t) => {
  const directory = installerWorkspace(t);
  const result = runInstaller(directory, "custom/anti-slop", "--jev=packages/jev");
  assert.equal(result.status, 0, result.stderr);
  assertCopiedBundle(join(assets, "anti-slop"), join(directory, "custom/anti-slop"));
  assertCopiedJev(join(directory, "packages/jev"));
  assert.equal(existsSync(join(directory, "custom/oxlint-plugin-jev")), false);
});

test("existing Jev destination refuses before creating the main destination", (t) => {
  const directory = installerWorkspace(t);
  const jevTarget = join(directory, "packages/jev");
  mkdirSync(jevTarget, { recursive: true });
  writeFileSync(join(jevTarget, "UPSTREAM.md"), "local Jev provenance\n");
  const result = runInstaller(directory, "new/anti-slop", "--jev=packages/jev");
  assert.equal(result.status, 1, result.stderr);
  assert.ok(result.stderr.includes(`Refusing to overwrite ${jevTarget}.`));
  assert.equal(existsSync(join(directory, "new")), false);
  assert.equal(readFileSync(join(jevTarget, "UPSTREAM.md"), "utf8"), "local Jev provenance\n");
});

test("existing main destination refuses without modifying either destination", (t) => {
  const directory = installerWorkspace(t);
  const target = join(directory, "custom/anti-slop");
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, "index.ts"), "local main plugin\n");
  const result = runInstaller(directory, "custom/anti-slop", "--jev");
  assert.equal(result.status, 1, result.stderr);
  assert.ok(result.stderr.includes(`Refusing to overwrite ${target}.`));
  assert.equal(readFileSync(join(target, "index.ts"), "utf8"), "local main plugin\n");
  assert.equal(existsSync(join(directory, "custom/oxlint-plugin-jev")), false);
});

test("--force overwrites matching files in both destinations and retains unrelated files", (t) => {
  const directory = installerWorkspace(t);
  const target = join(directory, "custom/anti-slop");
  const jevTarget = join(directory, "packages/jev");
  mkdirSync(target, { recursive: true });
  mkdirSync(jevTarget, { recursive: true });
  writeFileSync(join(target, "index.ts"), "old plugin\n");
  writeFileSync(join(jevTarget, "UPSTREAM.md"), "old provenance\n");
  writeFileSync(join(target, "local-only.txt"), "owned main file\n");
  writeFileSync(join(jevTarget, "local-only.txt"), "owned Jev file\n");
  const result = runInstaller(directory, "custom/anti-slop", "--jev=packages/jev", "--force");
  assert.equal(result.status, 0, result.stderr);
  assertCopiedBundle(join(assets, "anti-slop"), target);
  assertCopiedJev(jevTarget);
  assert.equal(readFileSync(join(target, "local-only.txt"), "utf8"), "owned main file\n");
  assert.equal(readFileSync(join(jevTarget, "local-only.txt"), "utf8"), "owned Jev file\n");
});
