# anti-slop

[![skills.sh](https://skills.sh/b/PaymentsWayProjects/typescript-anti-slop)](https://skills.sh/PaymentsWayProjects/typescript-anti-slop)

Opinionated Oxlint rules that reject low-evidence and low-signal TypeScript and JavaScript patterns.

Anti-slop is first and foremost the ruleset PaymentsWay uses across its work, projects, and teams. It reflects the organization's preferences and taste rather than attempting to be a universal coding standard.

**This project is meant to be vendored**, not treated as a fixed npm dependency. There is no official npm package. Copy the rules into your repository, read them, and change them to match your team's standards. The bundled agent skill handles the initial copy and configuration; after that, the vendored files are yours to maintain and make your own. Community-maintained forks and packages are welcome, but their compatibility and release lifecycle belong to their maintainers.

## Install with an agent skill

```bash
npx skills add PaymentsWayProjects/typescript-anti-slop --skill install-anti-slop
```

Then ask your coding agent to install or configure anti-slop in the current repository. The skill copies the plugin, installs compatible Oxlint dependencies—matching an existing Oxlint version when present—merges the plugin into the existing lint configuration, enables every generic rule, and validates the result. In repositories that depend directly on Effect, it also enables the opt-in Effect rule group.

For eligible Effect repositories, the skill also configures type-aware compiler diagnostics when the existing toolchain has a compatible `@effect/tsgo` release. It preserves lifecycle scripts and local diagnostics policy, and verifies accepted/rejected code through the configured lint command. See the [Effect diagnostics procedure](skills/install-anti-slop/references/effect-diagnostics.md) for compatibility checks, patch/wrapper setup, and the fresh-install severity defaults.

### Update an existing installation

Ask your agent to **update anti-slop while preserving local customizations**, optionally naming an upstream revision or selected fixes. The same skill stages incoming source separately, uses a three-way merge when the original upstream snapshot is recoverable, and otherwise ports reviewed changes conservatively. It preserves local rules and configuration, asks about conflicting policy and enabling new rules, and records provenance for future updates. It does not force-replace the vendored directory.

For latest upstream, ask the agent to retrieve and identify that revision; an already-installed skill bundle may be older. The copy script itself does not fetch or merge updates.

To inspect available skills first:

```bash
npx skills add PaymentsWayProjects/typescript-anti-slop --list
```

## Effect program design skill

```bash
npx skills add PaymentsWayProjects/typescript-anti-slop --skill effect-program-design
```

Use this skill for Effect v4 application design, services and layers, schemas, errors, observability, resources, concurrency, persistence, platform integration, and tests. Its complete guidance lives in [the skill](skills/effect-program-design/SKILL.md) and 16 focused reference files.

Effect guidance incorporates material credited to Kit Langton; see the [third-party attribution and license](skills/effect-program-design/ATTRIBUTION.md).

## Manual local installation

Copy `src/` into the target repository, for example at `tools/oxlint/anti-slop/`. If the repository already uses `oxlint`, install `@oxlint/plugins` at exactly the resolved Oxlint version. Otherwise, install the same current version of both packages. Keep both versions exact so upgrades move them together.

Register the copied entry point in `oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
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
  rules: {
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
});
```

The same `ignorePatterns`, `jsPlugins`, and rules work under `lint` in a Vite+ config. Merge the ignore patterns into Vite+'s `fmt.ignorePatterns` as well so `vp check` does not reformat installed agent assets or the vendored plugin. Preserve existing ignores and add any other project-local agent tooling directories detected in the repository; do not broadly ignore every dot-directory.

### Optional Effect rules

Effect-specific rules live in a separate plugin so projects that do not use Effect do not inherit Effect architecture policy. Register the Effect entry point only in repositories that use Effect:

```ts
export default defineConfig({
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    {
      name: "anti-slop-effect",
      specifier: "./tools/oxlint/anti-slop/effect/index.ts"
    }
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
    "anti-slop-effect/require-service-make-layer": "error"
  }
});
```

## Additional rule families

- [Martin Fowler smells](docs/martinfowler.md): eight deterministic rules in `martinfowler/index.ts`, plus semantic review questions. Register the AST plugin as `anti-slop-martinfowler`; use the guide's recommended warnings, leaving `message-chains` opt-in.
- [Jev semantic review](docs/jev.md): Effect and Fowler question catalogs, plugins, and a changed-file runner. The ready-built fork lives in `vendor/oxlint-plugin-jev/`, with its license and pinned provenance. Normal dependency installation is sufficient; no submodule checkout or Jev build is required.
- [Whole-diff review](docs/diff-rules.md): `diff-rules/run.ts` checks shotgun surgery, divergent change, duplicated code, and scope creep through a decision-model, LLM, or local command backend.

AI checks remain opt-in and outside the default lint/check pipeline. They can transmit source code or Git history and incur model charges; explicitly approve the backend and provider before enabling them. The imported model-backed tests use loopback HTTP fixtures or local commands, not real model services.

To vendor the real Jev package beside the rules:

```bash
node skills/install-anti-slop/scripts/install.mjs --jev
```

Then install the copied package through its local `file:` dependency and configure the plugins/overlay as described in the guides. The installer refuses existing destinations; use the update procedure to preserve local customizations.

## Rules

### Generic rules

- `max-ternary-depth` — limits ternary expression chains to two levels by default; configure `maxDepth` to change the limit.
- `no-array-filter-map` — rejects adjacent eager array filter/map passes while allowing lazy iterator pipelines.
- `no-reduce-accumulator-copy` — rejects non-spread accumulator copies inside reducers; complements native `oxc/no-accumulating-spread`.
- `no-chained-type-assertions` — rejects nested `as` and angle-bracket assertions that fabricate evidence; chains made only of `as const` remain valid.
- `no-conditional-spread` — rejects ternary and logical expressions in object, array, call, and JSX spreads. It has no autofix because omission and evaluation semantics must be preserved explicitly.
- `no-disabled-type-assertion-rules` — rejects inline disables of assertion-safety rules and blanket disable comments; justified exceptions belong in reviewed configuration overrides.
- `no-known-value-widening` — rejects known expressions flowing into explicit `unknown`, `object`, anonymous-object, or open-dictionary targets, including known arguments passed to local `unknown` type predicates. Empty dictionary accumulators and finite-key `Record` targets remain valid.
- `no-module-mocking` — rejects Vitest and Jest `mock`, `doMock`, and `unstable_mockModule` calls in favor of real dependency seams.
- `no-object-parameters` — rejects `object`, unions containing it, and scoped or transparent generic aliases that resolve to it on function inputs.
- `no-reflect-apply` — rejects global `Reflect.apply` in favor of typed function calls.
- `no-reflect-get` — rejects global `Reflect.get` in favor of typed property access or boundary parsing.
- `no-reprovide-ambient-service` — rejects yielding an Effect service only to provide that same value back into a nested operation.
- `no-runtime-typeof` — requires boundary parsing instead of ad hoc `typeof` narrowing. Existence probes against the string `"undefined"` are allowed, and type predicates can be enabled explicitly.
- `no-shape-in-symbol-names` — rejects the case-insensitive substring `shape` in locally owned symbol names while allowing static member names such as Zod's `schema.shape` that cannot be renamed locally.
- `no-unknown-parameters` — rejects `unknown` and unions containing it on function inputs except the explicit `cause` convention and the exact subject of a type predicate.
- `no-unknown-returns` — rejects explicit function contracts that resolve to `unknown`, `Promise<unknown>`, or `PromiseLike<unknown>`, including scoped and transparent generic aliases.
- `no-unknown-type-aliases` — rejects scoped and transparent generic aliases whose resolved type is `unknown`.
- `no-unsafe-dictionary-type` — rejects dictionary value contracts based on `unknown`, `any`, `object`, `{}`, and semantic equivalents. Generic constraints such as `T extends Record<string, unknown>` are allowed.
- `no-widen-then-assert` — rejects immutable local flows that widen known evidence to `unknown`, `any`, `object`, or a broad record and later assert it back to a narrower type.
- `require-readable-spacing` — autofixes missing blank lines between top-level declarations, around multiline bindings, before control flow/returns, and after blocks; preserves compact local bindings, imports, and overload groups.
- `require-safety-comment-for-type-assertion` — requires each non-const assertion to have a nearby, non-empty invariant justification. Marker prefixes are configurable and default to `SAFETY`.

Existing configurations must replace `anti-slop/no-conditional-empty-object-spread` with `anti-slop/no-conditional-spread`. The replacement also rejects logical expressions and spreads outside object literals; review the additional findings instead of treating the rename as behavior-neutral.

### Effect rules

- `no-manual-effect-error-tag` — rejects manual `_tag` comparisons and switches inside broad `Effect.catch`, `Effect.catchAll`, and `Effect.catchIf` handlers in favor of tagged error handlers.
- `no-manual-tag-comparison` — rejects direct `_tag` comparisons and `_tag` switches in favor of `Match`, `Predicate.isTagged`, or tagged-enum matching.
- `no-manual-tagged-construction` — rejects literal `_tag` object construction in favor of Schema, tagged class/error, or `Data.taggedEnum` constructors, including `_tag` object patterns passed to `Match.when` and `Match.not`, and literal `_tag` class fields.
- `no-manual-tagged-type` — rejects `_tag` properties written by hand in `type`, `interface`, and inline type declarations, including generic constraints. Infer the type from a Schema or Data tagged constructor instead.
- `no-ordie-in-service-construction` — rejects construction-time `Effect.orDie` and `Layer.orDie`, preserving typed construction failures.
- `no-service-constructor-imports` — rejects named `make<CapabilityName>` imports from relative project modules outside `*.test.*` and `*.spec.*` files. Runtime callers should import the owning Layer and yield the contextual service instead. Package and path-alias imports, default imports, and static constructors such as `WorkspaceName.make` are outside the rule.
- `no-service-parameters` — rejects Context, ManagedRuntime, Layer, and same-file service instances passed as function parameters.
- `no-test-code-in-src` — rejects test files, test imports, and test-named exports in production source directories.
- `prefer-effect-match` — rejects chained literal ternaries over the same value in favor of Effect's `Match` API.
- `prefer-tagged-error-handling` — rejects `Predicate.isTagged` checks on errors in broad Effect catch handlers in favor of `Effect.catchTag`/`Effect.catchTags`, or `Effect.catchReason`/`Effect.catchReasons` for `error.reason`.
- `prefer-yield-service` — rejects capturing an Effect context only to provide it back; yield the required services instead.
- `require-cause-when-narrowing` — requires error-remapping handlers to preserve the original error as a cause or capture it before narrowing.
- `require-operation-span` — requires operations returned by a service constructor to carry a named Effect span.
- `require-service-make-layer` — requires contextual service classes to expose `make` and a layer derived from it, with tag-only classes allowed by default.

### Analysis boundaries

The rules use Oxlint's ESTree and lexical-scope APIs rather than a TypeScript type checker. They resolve same-file aliases—including block-scoped aliases, forward references, and transparent generic aliases—but do not infer imported type definitions or cross-file call signatures. Rules that inspect calls therefore document when enforcement is intentionally local.

## Violation examples

Each snippet below is rejected by the named rule.

### `max-ternary-depth`

```ts
const value = first ? one : second ? two : third ? three : fallback;
```

### `no-array-filter-map`

```ts
const users: User[] = loadUsers();
const emails = users.filter(user => user.active).map(user => user.email);
const found = users.map(lookup).filter(value => value !== undefined);
```

Prefer lazy iterator helpers where the target runtime supports them:

```ts
const emails = users.values()
  .filter(user => user.active)
  .map(user => user.email)
  .toArray();
```

A single `flatMap(user => user.active ? [user.email] : [])` or a reducer that pushes into a fresh local array is also allowed. Iterator helpers avoid intermediate arrays and per-item wrapper arrays, but are not guaranteed to be faster. Check runtime support; TypeScript library declarations do not polyfill them.

This AST/scope rule recognizes array literals, direct array/tuple annotations, immutable local aliases, and supported array-preserving method chains. Unknown receivers (including imported factory results and unannotated parameters), type aliases, and property-based array types are not inferred. Iterator pipelines are not flagged. Both `filter().map()` and `map().filter()` are covered, regardless of predicate. There is no autofix: callback ordering, indexes, `thisArg`, sparse arrays, and truthiness filtering must be reviewed before changing APIs.

### `no-reduce-accumulator-copy`

```ts
items.reduce((acc, item) => Object.assign({}, acc, { [item.id]: item }), {});
items.reduce((acc, item) => acc.concat([item]), []);
items.reduce((acc, item) => {
  const next = acc.slice();
  next.push(item);
  return next;
}, []);
```

Instead, mutate a fresh, locally owned accumulator and return it:

```ts
items.reduce((acc, item) => {
  acc.push(item);
  return acc;
}, []);
```

`Object.assign(acc, item)` is also allowed. Copying individual input items is not copying accumulated state.

The rule covers inline `reduce`/`reduceRight` callbacks, including index parameters, and immutable local accumulator aliases. It detects global `Object.assign` with an object-literal target and the accumulator as a source, global `Array.from(acc)`, and array accumulator calls to `concat`, `slice`, `toSpliced`, `toSorted`, `toReversed`, and `with`. Array copy methods require local array evidence for the initial value so string concatenation and unknown custom collections are not flagged. Like the native rule, reducer method names are syntactic evidence, not proof of the receiver's runtime type. Named callbacks, nested functions, indirect copy helpers, nested accumulator properties, and reassigned aliases are outside its scope. Copying a bounded accumulator is not necessarily quadratic, but these patterns are rejected because growing accumulators can be.

Enable native `oxc/no-accumulating-spread` alongside it for array/object spreads in reducers and supported loops. Neither rule proves that every possible quadratic reduction is absent. No automatic mutation rewrite is provided because accumulator ownership cannot be established syntactically.

### `no-chained-type-assertions`

```ts
const user = input as object as User;
```

### `no-conditional-spread`

```ts
const options = {
  ...(timeout !== undefined ? { timeout } : {}),
};
const items = [...(ready ? pending : [])];
send(...(args ?? []));
```

### `no-reprovide-ambient-service`

```ts
import * as Effect from "effect/Effect";

const operation = Effect.gen(function* () {
  const service = yield* Service;
  return yield* nested.pipe(Effect.provideService(Service, service));
});
```

Leave the dependency in the nested operation's environment and provide its implementing Layer at runtime composition instead.

### `no-known-value-widening`

```ts
const handlers: Record<string, Handler> = {
  start: startHandler,
};
```

This discards the known `start` key. Preserve inference or use `satisfies Record<string, Handler>` instead.

Known values must not be widened back to `unknown` through a local type predicate:

```ts
function isUser(value: unknown): value is User {
  return UserSchema.safeParse(value).success;
}

declare const user: User;
isUser(user);
```

Call the predicate at the unparsed boundary, while the argument is still `unknown`.

### `no-module-mocking`

```ts
vi.mock("./user-store");
```

### `no-object-parameters`

```ts
function save(value: object) {}
```

### `no-reflect-apply`

```ts
const value = Reflect.apply(operation, owner, args);
```

### `no-reflect-get`

```ts
const value = Reflect.get(owner, key);
```

### `no-runtime-typeof`

```ts
if (typeof input === "string") {
  useName(input);
}
```

Schema-free projects can permit `typeof` checks directly inside type predicate and
assertion functions while continuing to reject ad hoc checks elsewhere:

```json
{
  "anti-slop/no-runtime-typeof": [
    "error",
    { "allowInTypeGuards": true }
  ]
}
```

The option defaults to `false`. Existence probes such as `typeof document === "undefined"` are always allowed because they establish whether a binding exists rather than narrow its representation.

### `no-shape-in-symbol-names`

```ts
interface UserShape {
  id: string;
}
```

Static member reads such as `schema.shape` are allowed because the member name belongs to the value's owner and cannot be renamed locally.

### Effect: `no-service-constructor-imports`

```ts
import { makeIssueService } from "./issue-service.ts";
```

Import the owning Layer and yield `IssueService` instead. Focused `*.test.*` and `*.spec.*` files may import the constructor directly.

### Effect: tagged values and matching

Direct tag checks are rejected by `no-manual-tag-comparison`:

```ts
if (result._tag === "Ready") useReady(result);
```

Use `Predicate.isTagged` for a predicate or `Match` for branching:

```ts
if (Predicate.isTagged("Ready")(result)) useReady(result);
```

Literal tag objects are rejected by `no-manual-tagged-construction`:

```ts
const result = { _tag: "Ready", value };
```

Use the existing Schema, tagged class/error, or `Data.taggedEnum` constructor instead, such as `Ready.make({ value })`. Object patterns with `_tag` passed to `Match.when` and `Match.not` are rejected too; use `Match.tag`/`Match.tags`.

Manual tagged type declarations are rejected by `no-manual-tagged-type`:

```ts
type Ready = { readonly _tag: "Ready"; readonly value: string };
```

Infer the type from its tagged constructor instead, for example `export type Ready = typeof Ready.Type`.

Manual tag branching in broad catch handlers is rejected by `no-manual-effect-error-tag`:

```ts
program.pipe(
  Effect.catch((error) =>
    error._tag === "NotFound" ? recover : Effect.fail(error)
  )
);
```

Use the selective error operator:

```ts
program.pipe(Effect.catchTag("NotFound", () => recover));
```

For a tagged `error.reason`, use `Effect.catchReason` or `Effect.catchReasons`.

`Predicate.isTagged` checks on the error in broad catch handlers are rejected by `prefer-tagged-error-handling`:

```ts
program.pipe(
  Effect.catch((error) =>
    Predicate.isTagged(error, "NotFound") ? recover : Effect.fail(error)
  )
);
```

Use `Effect.catchTag("NotFound", () => recover)` here as well.

Repeated literal ternaries over the same value are rejected by `prefer-effect-match`:

```ts
const label = kind === "a" ? "A" : kind === "b" ? "B" : "Other";
```

Use `Match`:

```ts
const label = Match.value(kind).pipe(
  Match.when("a", () => "A"),
  Match.when("b", () => "B"),
  Match.orElse(() => "Other")
);
```

These rules are syntactic. They recognize direct `Effect.catch*` and `Match.when`/`Match.not` calls under those exact identifiers and do not resolve import aliases or verify that similarly named objects came from Effect. `prefer-effect-match` compares the source text of the repeatedly tested expression; it does not infer its type or prove exhaustiveness.

### `no-unknown-parameters`

```ts
function handle(input: unknown) {}
```

A type predicate may accept `unknown` for the parameter it narrows; other `unknown`
parameters on the same function remain rejected.

### `no-unknown-returns`

```ts
function loadUser(): unknown {
  return input;
}
```

### `no-unknown-type-aliases`

```ts
type ExternalValue = unknown;
```

### `no-unsafe-dictionary-type`

```ts
type Metadata = Record<string, unknown>;
type OtherMetadata = { [key: string]: object };
```

### `no-widen-then-assert`

```ts
const loaded: User = loadUser();
const stored: unknown = loaded;
const user = stored as User;
```

### `require-readable-spacing`

```ts
export const first = 1;
/** Documentation stays attached to second. */
export const second = 2;
```

Autofix inserts a blank line before the documentation. Inside functions, adjacent short variable declarations stay grouped, while multiline bindings and control-flow boundaries receive spacing. Adjacent function overload signatures and their implementation remain grouped. Existing blank lines are never removed. The rule takes no options; edit the vendored policy if your team's preferences differ.

Run `oxlint --fix` (or `vp lint --fix`), then your formatter, then lint again. The rule inserts whitespace only; it does not add braces, wrap expressions, sort imports, or infer every logical group. Keep indentation and wrapping with the formatter rather than enabling a competing stylistic preset.

The comment-aware engine is [vendored from ESLint Stylistic](src/vendor/eslint-stylistic/UPSTREAM.md) under MIT. Copy its `LICENSE` and provenance along with the code; no third-party plugin dependency is needed.

### `require-safety-comment-for-type-assertion`

```ts
const userId = value as UserId;
```

Add a specific justification immediately before a necessary assertion:

```ts
// SAFETY: parseUserId validated the identifier before branding it.
const userId = value as UserId;
```

`SAFETY` remains the default marker. Comments immediately above exported declarations are recognized. Repositories with an established convention can configure one or more alternatives; every marker must still be followed by a colon and a non-empty justification:

```json
{
  "anti-slop/require-safety-comment-for-type-assertion": [
    "error",
    { "markers": ["INVARIANT", "SAFETY"] }
  ]
}
```

## Development

```bash
pnpm install
pnpm check
```

`src/` is canonical. After changing production source, run `pnpm sync:skill-assets`. CI checks that both asset bundles match their canonical sources. `pnpm check` runs Oxlint, rule and CLI tests, installer tests, TypeScript typechecking, and the skill-asset drift check.

### Repository diagnostics

`oxlint.config.ts` loads every `@effect/tsgo` preset and promotes its diagnostics to errors, except `missing-pipeable-signature`: this plugin does not require data-last overloads on exported functions. The CLI integration tests permit native Node imports to exercise the real filesystem and subprocess boundary. Third-party vendor source and generated skill assets are excluded from repository linting.

The toolchain pins a compatible diagnostic generation rather than automatically adopting the newest Effect release. Newer presets introduce Effect collection/string migration policies; this native Oxlint plugin does not add an Effect runtime dependency merely to satisfy those preferences. Review new diagnostics before upgrading the pinned Oxlint/plugins, `@effect/tsgo`, and `oxlint-tsgolint` versions together.

Dependency installation runs `prepare` to patch the local TypeScript, Oxlint, and tsgolint binaries. The existing frozen-lockfile CI install runs the same lifecycle hook. If installation scripts were disabled, run `pnpm prepare` before linting. Use a writable local installation; this pinned setup is not intended for shared or read-only package stores.

Effect diagnostics are owned by Oxlint; the compiler plugin disables duplicate reporting. Typechecking includes the lint configuration and enables unchecked-index, exact-optional-property, override, and switch-fallthrough safety checks.

## License

MIT
