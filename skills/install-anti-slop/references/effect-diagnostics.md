# Effect compiler diagnostics

Use for fresh installations in repositories with a direct `effect` dependency or an explicit request for Effect rules. For existing installations, follow [the update procedure](update.md) before adding diagnostics or changing local policy. These type-aware `effecttsgo/*` rules complement the bundled `anti-slop-effect/*` ESTree rules; neither replaces the other.

## 1. Establish compatibility

Read the target's resolved TypeScript, Oxlint, `@oxlint/plugins`, and `oxlint-tsgolint` versions, existing Effect language service setup, package scripts, and lint configuration. For Vite+, identify the Oxlint version it actually resolves rather than assuming a separately installed CLI is the one `vp check` runs.

Select the newest `@effect/tsgo` release whose **Supported Package Versions** table includes the target TypeScript and Oxlint versions and a compatible `oxlint-tsgolint`. Read the README shipped with that release; the current upstream README may describe a different release. Check platform support too: the documented native builds do not support Linux musl.

Keep the existing toolchain when no compatible release exists. Report the incompatible versions and the integration as blocked; ask before a toolchain migration. Preserve an existing `@effect/language-service` setup on older TypeScript instead of replacing it with an unsupported `@effect/tsgo` installation.

Complete when a supported release/toolchain combination is identified, or the compatibility blocker is recorded without changing dependencies.

## 2. Install and integrate the runtime

Install the selected `@effect/tsgo` and compatible `oxlint-tsgolint` as development dependencies using the repository's package manager. Pin the selected versions and retain the matching `oxlint` / `@oxlint/plugins` pair. Avoid an unversioned setup wizard that could upgrade the toolchain.

For a writable, project-local `node_modules`, use the Oxlint-only patch:

```sh
pnpm exec effect-tsgo patch --no-typescript --oxlint
```

Adapt the package-manager invocation to the target repository. Append `effect-tsgo patch --no-typescript --oxlint` to its existing `prepare` workflow, preserving existing commands and their failure behavior. Add a new `prepare` script only when none exists. Keep an existing TypeScript patch workflow if the repository intentionally uses it; the Oxlint-only integration does not require patching the compiler.

For shared or read-only package stores, use the selected release's documented non-mutating wrapper instead, if available: `effect-tsgo oxlint --type-aware` or `effect-tsgo vp check`. Wire the wrapper into the lint/check commands CI actually runs; leave unrelated script arguments intact. Do not add a patch lifecycle hook in this mode. Check config typing support for that release: current documentation says Oxlint config type augmentation is applied only by `patch`.

Merge this entry into `compilerOptions.plugins` in the applicable `tsconfig.json`, preserving other plugins and existing Effect options. Update an existing entry rather than adding a duplicate:

```json
{
  "name": "@effect/language-service",
  "diagnostics": false
}
```

Disable editor/compiler diagnostics here only once the Oxlint route is active, so diagnostics have one verified owner. If setup fails, restore the previous diagnostics setting rather than leaving the project without Effect diagnostics.

Complete when the selected runtime route works, survives dependency installation through its script or wrapper, and existing lifecycle and editor behavior is preserved.

## 3. Merge presets and severities

For a fresh installation, extend every preset exported by the installed release and promote its rules to errors, except `missing-pipeable-signature`. That rule demands data-last overloads on exported multi-argument functions, which is not a default anti-slop requirement.

This standalone example shows the diagnostics fields for `oxlint.config.ts`; merge them into the existing config rather than replacing its plugins, ignores, rules, or `extends`:

```ts
import { presets } from "@effect/tsgo/oxlint-presets";
import { defineConfig } from "oxlint";

const effectPresets = Object.values(presets);
const effectDiagnosticRules = Object.fromEntries(
  effectPresets.flatMap((preset) =>
    Object.keys(preset.rules ?? {}).map((rule) => [rule, "error"]),
  ),
);

export default defineConfig({
  extends: effectPresets,
  rules: {
    ...effectDiagnosticRules,
    "effecttsgo/missing-pipeable-signature": "off",
  },
});
```

The presets enable type-aware mode and register `effecttsgo`; listing rule names alone does not. Preserve those settings when merging. For Vite+, put the same fields under `lint` in the existing Vite+ config and keep its existing `defineConfig` import. For JSON configuration, extend the installed release's preset JSON paths and materialize the equivalent rule severities from those presets; JSON cannot import or execute this example. Preserve any existing schema setting unless a schema change is needed and understood.

During updates, approved local rule settings take precedence over these fresh-install defaults. Preserve explicit disabled rules and overrides, and obtain approval for newly enabled diagnostics as required by the update procedure.

Complete when all selected presets load, their rules have the intended severities, and existing anti-slop and project configuration remains effective.

## 4. Prove diagnostics reach the user

Run the configured lint command and typecheck; for Vite+, run the full configured check command. A successful typecheck alone does not prove the Oxlint integration is active.

Use disposable accepted and rejected TypeScript fixtures included in a real TypeScript project and not excluded by lint ignores. For example, a bare `Effect.succeed(1)` expression should report `effecttsgo/floating-effect`, while exporting that Effect value should not report that diagnostic. Confirm the named rule and a failing exit status for the rejected fixture, then remove only the fixtures you created. Use the same patched CLI or wrapper that the repository and CI run.

Report application findings separately from patch, configuration, or typechecking failures. Record the selected versions, runtime route, severity exception, check results, and any blockers in the installation's provenance record. Claim complete integration only after the accepted/rejected smoke check succeeds.

## References

- Verify release-specific behavior against the installed package and the [Effect tsgo documentation](https://github.com/Effect-TS/tsgo#supported-package-versions) and [Oxlint setup guide](https://github.com/Effect-TS/tsgo/blob/main/docs/README.md).
