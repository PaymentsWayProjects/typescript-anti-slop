import { presets } from "@effect/tsgo/oxlint-presets";
import { defineConfig } from "oxlint";

const effectPresets = Object.values(presets);
const effectDiagnosticRules = Object.fromEntries(
  effectPresets.flatMap((preset) =>
    Object.keys(preset.rules ?? {}).map((rule) => [rule, "error"] as const),
  ),
);

/** Repository diagnostics use every Effect preset without requiring data-last public APIs. */
export default defineConfig({
  extends: effectPresets,
  ignorePatterns: ["src/vendor/**", "skills/install-anti-slop/assets/**"],
  rules: {
    ...effectDiagnosticRules,
    "effecttsgo/missing-pipeable-signature": "off",
    "oxc/no-accumulating-spread": "error",
  },
  overrides: [
    {
      // These tests exercise real Node filesystem and subprocess-based CLI boundaries.
      files: [
        "src/rules/require-readable-spacing-cli.test.ts",
        "src/rules/no-reprovide-ambient-service-cli.test.ts",
        "src/jev/plugin.test.ts",
      ],
      rules: { "effecttsgo/node-builtin-import": "off" },
    },
  ],
});
