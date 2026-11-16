---
name: install-anti-slop
description: Install, configure, or update vendored anti-slop Oxlint plugins while preserving local customizations. Use when adding rules, adopting upstream fixes, or configuring Effect compiler diagnostics alongside anti-slop.
---

# Install or update anti-slop

Anti-slop is vendored code: the target repository owns its rules, diagnostics, tests, and configuration. Preserve those choices when bringing in upstream changes.

## Choose the path

Read the repository's agent instructions and `git status`. Identify its package manager, Oxlint/Vite+ configuration, and any existing anti-slop entry points, including renamed or relocated copies referenced by `jsPlugins`.

- **Existing installation — update, upgrade, migrate, or reconfigure:** read [Update a vendored installation](references/update.md) and follow that procedure instead of the fresh-install steps below.
- **No installation — fresh install:** follow the procedure below. If the user requested an update but no installation can be found, confirm the target before installing.

Complete when the operation and target path are established and pre-existing work is identified.

## Fresh install

1. Copy the bundled plugin from this skill. Run from the target repository:

   ```bash
   node <skill-directory>/scripts/install.mjs
   ```

   This creates `tools/oxlint/anti-slop/`. Pass another relative destination as the first argument when the repository has an established tooling layout. Add `--jev` only when the user opts into the Jev checks below: it also copies the prebuilt `oxlint-plugin-jev` fork to `oxlint-plugin-jev/` beside the plugin (`--jev=<destination>` for another place). All requested destinations are checked before either copy begins. The script refuses to replace an existing destination; route existing copies through the update procedure rather than `--force`.

   Preserve the nested `vendor/eslint-stylistic/LICENSE` and `UPSTREAM.md`; they travel with the copied rule. Readability enforcement is self-contained and requires no Stylistic plugin dependency. When copying Jev, also preserve its complete `dist/`, `LICENSE`, and `UPSTREAM.md`; use the recorded immutable fork identity rather than inferring it from another repository's HEAD.

   Complete when the files, including vendored license and provenance, exist at the agreed destination without replacing an existing copy.

2. Install current compatible dependencies rather than trusting versions remembered by the agent:
   - If the repository already depends on `oxlint`, read its installed version from the package manager or lockfile and install `@oxlint/plugins` at exactly that version. Pin it exactly rather than by range so future upgrades move both packages together.
   - Only when the repository has no `oxlint` dependency, query `npm view oxlint version` and `npm view @oxlint/plugins version`, then install the same current version of both packages.
   - `oxlint` is a development dependency. The copied source imports `@oxlint/plugins`, so install it as a development dependency for a local-only plugin.
   - Do not replace the package manager or rewrite unrelated dependency ranges.

   Complete when matching compatible versions are installed and unrelated dependency ranges are preserved.

3. Register the generic plugin, configure ignores, and enable all generic rules. For `oxlint.config.ts` or `.oxlintrc.json`, merge these fields with the existing configuration:

   Treat the copied generic and Effect entry points as the rule inventory. Verify every configured rule is exported by this bundle before enabling it. A reference repository may contain newer rules or different names; adopt their implementations before configuring them rather than copying an incompatible rule list.

   ```ts
   ignorePatterns: [
     ".agent/**",
     ".agents/**",
     ".claude/**",
     ".codex/**",
     ".continue/**",
     ".cursor/**",
     ".gemini/**",
     ".opencode/**",
     ".pi/**",
     ".roo/**",
     ".windsurf/**",
     "tools/oxlint/anti-slop/**",
   ],
   jsPlugins: [
     { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
   ],
   ```

   Keep every existing ignore. Adjust the final pattern when the plugin was copied elsewhere. Inspect the repository for other project-local agent tooling directories and add them rather than linting installed skills, hooks, or generated agent configuration as application source. Do not broadly ignore all dot-directories, because some repositories keep owned source or checks in them.

   For Vite+, add these fields to `lint.ignorePatterns` and `lint.jsPlugins`. Also merge the same patterns into `fmt.ignorePatterns` so `vp check` does not reformat installed agent assets or the vendored plugin. Merge existing entries instead of replacing them.

   Enable these rules at `"error"`, including the native Oxlint companion rule:

   ```json
   {
     "anti-slop/max-ternary-depth": ["error", { "maxDepth": 2 }],
     "oxc/no-accumulating-spread": "error",
     "anti-slop/no-array-filter-map": "error",
     "anti-slop/no-reduce-accumulator-copy": "error",
     "anti-slop/no-chained-type-assertions": "error",
     "anti-slop/no-conditional-spread": "error",
     "anti-slop/no-disabled-type-assertion-rules": "error",
     "anti-slop/no-known-value-widening": "error",
     "anti-slop/no-module-mocking": "error",
     "anti-slop/no-object-parameters": "error",
     "anti-slop/no-reflect-apply": "error",
     "anti-slop/no-reflect-get": "error",
     "anti-slop/no-reprovide-ambient-service": "error",
     "anti-slop/no-runtime-typeof": "error",
     "anti-slop/no-shape-in-symbol-names": "error",
     "anti-slop/no-unknown-parameters": "error",
     "anti-slop/no-unknown-returns": "error",
     "anti-slop/no-unknown-type-aliases": "error",
     "anti-slop/no-unsafe-dictionary-type": "error",
     "anti-slop/no-widen-then-assert": "error",
     "anti-slop/require-readable-spacing": "error",
     "anti-slop/require-safety-comment-for-type-assertion": "error"
   }
   ```

   For `no-array-filter-map`, prefer lazy `.values().filter(...).map(...).toArray()` pipelines only when the target runtime supports iterator helpers; otherwise use an appropriate single `flatMap` or locally mutating reducer. Review callback order, indexes, sparse arrays, `thisArg`, and filtering semantics rather than mechanically rewriting chains. Unknown receiver types are deliberately not inferred by this AST/scope rule.

   Pair `no-reduce-accumulator-copy` with native `oxc/no-accumulating-spread`: the custom rule catches supported non-spread copies such as `Object.assign({}, acc, item)`, `Array.from(acc)`, and array accumulator `concat`/`slice` calls. Mutating a fresh local accumulator is allowed; copying individual input items is also allowed. Named callbacks, indirect helpers, and nested accumulator properties are not fully analyzed, so do not claim all quadratic reducers are ruled out.

   If the repository declares `effect` in a package manifest, or the user explicitly requests Effect rules, also register the opt-in Effect plugin:

   ```ts
   jsPlugins: [
     {
       name: "anti-slop-effect",
       specifier: "./tools/oxlint/anti-slop/effect/index.ts",
     },
   ],
   rules: {
     "anti-slop-effect/no-manual-effect-error-tag": "error",
     "anti-slop-effect/no-manual-tag-comparison": "error",
     "anti-slop-effect/no-manual-tagged-construction": "error",
     "anti-slop-effect/no-manual-tagged-type": "error",
     "anti-slop-effect/no-ordie-in-service-construction": "error",
     "anti-slop-effect/no-service-constructor-imports": "error",
     "anti-slop-effect/no-service-parameters": "error",
     "anti-slop-effect/no-test-code-in-src": "error",
     "anti-slop-effect/prefer-effect-match": "error",
     "anti-slop-effect/prefer-tagged-error-handling": "error",
     "anti-slop-effect/prefer-yield-service": "error",
     "anti-slop-effect/require-cause-when-narrowing": "error",
     "anti-slop-effect/require-operation-span": "error",
     "anti-slop-effect/require-service-make-layer": "error",
   },
   ```

   Merge these entries with the generic plugin configuration rather than replacing it. Do not enable the Effect plugin merely because Effect appears transitively in a lockfile; require a direct package-manifest dependency or an explicit user request. The rule covers relative project imports. Report package-alias imports as a current limitation rather than pretending they are enforced.

   For eligible Effect repositories, also follow [Effect compiler diagnostics](references/effect-diagnostics.md). This adds type-aware diagnostics beyond the bundled ESTree rules, subject to the target toolchain's compatibility. Keep existing diagnostics policy during updates; the fresh-install defaults are not permission to reset local choices.

   Complete when the generic and eligible Effect rules are registered, compiler diagnostics are verified or explicitly blocked by compatibility, and existing configuration is preserved.

   **Optional Martin Fowler AST smells:** these deterministic checks are free and may run in the editor. Merge this plugin and recommended warnings into the base config:

   ```ts
   jsPlugins: [
     {
       name: "anti-slop-martinfowler",
       specifier: "./tools/oxlint/anti-slop/martinfowler/index.ts",
     },
   ],
   rules: {
     "anti-slop-martinfowler/global-data": "warn",
     "anti-slop-martinfowler/long-function": ["warn", { maxStatements: 30, maxLines: 80 }],
     "anti-slop-martinfowler/long-parameter-list": ["warn", { max: 4 }],
     "anti-slop-martinfowler/loops": "warn",
     "anti-slop-martinfowler/mutable-data": "warn",
     "anti-slop-martinfowler/mysterious-name": "warn",
     "anti-slop-martinfowler/repeated-switches": "warn",
     // Optional only for suitable code: message-chains cannot distinguish wire payloads.
     // "anti-slop-martinfowler/message-chains": ["warn", { maxDepth: 3 }],
   },
   ```

   Smells are review prompts, not proof of a defect. Preserve local thresholds and exceptions; see [the Fowler catalog](https://github.com/PaymentsWayProjects/typescript-anti-slop/blob/main/docs/martinfowler.md) for options.

   **Optional AI checks:** obtain the user's opt-in before enabling either family. Model requests are paid and nondeterministic. Jev sends source snippets or whole files; diff review sends diff text, purpose, commit subjects, and history summaries to the configured backend. Review data policy first; code that must stay on the machine requires a local judge/backend. Keep ordinary lint and editor checks free of AI requests.

   - **Jev questions:** run the installer with `--jev`, then install the copied fork as a local development dependency, for example `npm install --save-dev ./tools/oxlint/oxlint-plugin-jev`. Its `ai`, `@ai-sdk/typesafe-ai`, `zod`, and `synckit` dependencies install normally. Add its directory to both lint and format ignores. The package needs Node 22 or later; the changed-file runner needs Node 22.18 or later.
     - Register `{ name: "anti-slop-effect-jev", specifier: "./tools/oxlint/anti-slop/jev/plugin.ts" }` for eligible Effect repositories and `{ name: "anti-slop-martinfowler-jev", specifier: "./tools/oxlint/anti-slop/martinfowler/jev-plugin.ts" }` for any repository in the base `jsPlugins`, without enabling their rules there.
     - Create `oxlint.jev.config.ts` using [the Jev setup and overlay](https://github.com/PaymentsWayProjects/typescript-anti-slop/blob/main/docs/jev.md#setup). Spread the base (`...base`, `rules: { ...base.rules }`, `overrides: [...(base.overrides ?? [])]`) instead of `extends: [base]`, because Oxlint rejects relative `jsPlugins` inherited through `extends` in TypeScript configs. Enable all `effectSourceJevRules` ids at `"error"` and all `martinFowlerJevRules` ids at `"warn"`. For test globs, turn source and smell questions `"off"` and enable `anti-slop-effect-jev/test-cannot-fail` at `"error"` when the Effect plugin is installed. A disabled question sends nothing; preserve per-question policy.
     - Add `"lint:jev": "node tools/oxlint/anti-slop/jev/lint-changed.ts -c oxlint.jev.config.ts"` and `"lint:jev:full": "node tools/oxlint/anti-slop/jev/lint-changed.ts --all -c oxlint.jev.config.ts"`. Include normal checks plus `lint:jev` in `check:fast`, and normal checks plus `lint:jev:full` in `check:full`. The runner selects changed files and sets `JEV_CHANGED_ONLY=1`; `--all` sets it to `0`.
     - Let the user configure `TYPESAFE_API_KEY`, `FACTORY_API_KEY`, or `AI_GATEWAY_API_KEY`, including CI secrets. Both plugin entries set `ci: "fail"`: missing keys or service failures fail CI rather than silently skipping. For pull requests, fetch the base and set `JEV_CHANGED_ONLY=1` and `JEV_CHANGED_BASE=origin/<base>`. Judge mode uses `judge: { model }` in the vendored entries; a bare model id uses AI Gateway, or `judge.provider` names a module default-exporting an installed AI SDK provider.
     - The two plugins send up to two requests per file. [The combined-plugin recipe](https://github.com/PaymentsWayProjects/typescript-anti-slop/blob/main/docs/jev.md#two-plugins-or-one) uses both catalogs in one `createJevPlugin` for one request per file. Record the fork commit from its copied `UPSTREAM.md` in anti-slop's provenance.
   - **Whole-diff review:** add `"lint:diff": "node tools/oxlint/anti-slop/diff-rules/run.ts"` to `check:full` only, not `check:fast`. Keep the vendored source outside `node_modules` so Node can strip its types; use Node 22.18 or later. Defaults warn on `shotgun-surgery`, `divergent-change`, `duplicated-code`, and `scope-creep`. Add `anti-slop-diff-rules.config.ts` only for intentional rule, cutoff, backend, or exclude changes; consult [diff review setup](https://github.com/PaymentsWayProjects/typescript-anti-slop/blob/main/docs/diff-rules.md).
     - Choose TypeSafe/Factory/AI Gateway decision models, an LLM judge (`LLM_JUDGE_BASE_URL` plus `LLM_JUDGE_MODEL` for an OpenAI-compatible server), or a judge `command`. Without credentials, model backends warn and exit 0; explicitly choose `--fail` or `ci: "fail"` when CI must enforce availability. A command backend needs no API credentials itself; its command owns its access and privacy policy.
     - Install only the selected backend's runtime dependencies as development dependencies: `ai@7.0.173 zod@4.6.7 @ai-sdk/typesafe-ai@3.0.40` for TypeSafe or Factory decision models; `ai@7.0.173 zod@4.6.7 @ai-sdk/anthropic@4.0.105` for Factory chat judges; `ai@7.0.173 zod@4.6.7` for AI Gateway; or `ai@7.0.173 zod@4.6.7 @ai-sdk/openai-compatible@3.0.92` for an OpenAI-compatible judge. The command backend needs no SDK.
   - **Consumer typechecking:** keep the copied tooling outside the application's TypeScript `include` paths. If a broad `include` reaches the copied folder, merge that exact destination into `exclude` and preserve existing exclusions. An exclusion does not remove files imported by application code.
     - If you intentionally typecheck the full copied tree, install all SDK packages listed above, not only the selected backend's packages. Literal dynamic imports require those packages during compilation even when runtime execution never selects them. Also install the copied Jev package, matching `@oxlint/plugins`, and Node type definitions. These dependencies do not enable AI checks.

   Complete when each opted-in family is configured with approved severities, dependencies, provenance, ignores, and explicit cost/privacy policy; leave unrequested AI checks disabled.

4. Run the repository's lint command and typecheck. For Vite+, run the repository's full `vp check` command after adding both lint and format ignores. If findings appear in owned project source, report them and fix them only when the user asked for migration/cleanup. Do not suppress rules, weaken rule severity, add unsafe casts, or mechanically launder types to make lint pass.

   When cleanup is authorized, apply `require-readable-spacing` with lint autofix, then run the repository's formatter and lint again. Confirm a second fix/format pass leaves files unchanged. Keep whitespace fixes separate from semantic edits, preserve documentation attachment and overload groups, and do not enable an entire competing formatting preset.

   Complete when checks have run, fix/format stability has been verified for authorized cleanup, and every failure is resolved or reported with its diagnostics.

5. Record provenance in `UPSTREAM.md` beside the vendored entry point: source repository, exact source commit or recoverable pristine snapshot when available, installed plugin paths, and intentional deviations. Verify that the revision identifies the actual copied assets; a package version or the current upstream HEAD alone is insufficient. If provenance cannot be established, record it as unknown rather than guessing.

   Review the final diff and report the installed path, source identity, dependency/configuration changes, and check results. Complete when the record and report describe the files actually installed and any remaining findings.
