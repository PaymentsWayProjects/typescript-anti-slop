# oxlint-plugin-jev (vendored build)

- Package: `oxlint-plugin-jev` (vendored distribution)
- Commit: fd3e4b1ad3b8fa7c0d08cdc92633e33c7e662f9e
- Built with `pnpm build:jev` in anti-slop (`npm ci` and `vp pack` in the `vendor/oxlint-plugin-jev` submodule).
- Contents: `dist/`, `LICENSE`, `README.md`, and `package.json` keeping only `name`, `version`, `description`, `license`, `type`, `exports`, `files`, `dependencies`, `peerDependencies`, `engines`.
- Local changes: documentation links and installation instructions adapted for this repository; `dist/` is unchanged.

Install it as a local package, for example `"oxlint-plugin-jev": "file:./tools/oxlint/oxlint-plugin-jev"`, so its
dependencies install normally. Do not edit `dist/`; rebuild from the source commit instead.
