/// <reference types="node" />

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const probeRoot = mkdtempSync(join(tmpdir(), "anti-slop-ambient-service-"));
const config = join(probeRoot, "oxlint.json");
const first = join(probeRoot, "first.ts");
const second = join(probeRoot, "second.ts");

try {
  writeFileSync(
    config,
    JSON.stringify({
      categories: { correctness: "off" },
      jsPlugins: [
        { name: "anti-slop", specifier: fileURLToPath(new URL("../index.ts", import.meta.url)) },
      ],
      rules: { "anti-slop/no-reprovide-ambient-service": "error" },
    }),
  );

  // Each file's foreign namespace is the other's Effect namespace, so either file order exposes retained state.
  for (const [effectName, foreignName, file] of [
    ["First", "Second", first],
    ["Second", "First", second],
  ] as const) {
    writeFileSync(file, `
import { Effect as ${effectName} } from "effect";
import { Effect as ${foreignName} } from "other-library";
export const operation = ${effectName}.gen(function* () {
	const service = yield* Service;
	return request.pipe(${foreignName}.provideService(Service, service));
});
`);
  }

  const result = spawnSync(
    "pnpm",
    ["exec", "oxlint", "--threads=1", "--config", config, first, second],
    { encoding: "utf8", timeout: 30_000 },
  );
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${result.stdout ?? ""}\n${result.stderr ?? ""}`);
} finally {
  rmSync(probeRoot, { recursive: true, force: true });
}
