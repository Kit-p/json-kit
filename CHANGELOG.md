## [2.0.0](https://github.com/Kit-p/json-kit/compare/v1.1.1...v2.0.0) (2023-07-30)


### ⚠ BREAKING CHANGES

* **signature:** CHANGES

### Features

* **serialize:** add generic type and typeGuard parameter to serialize and deserialize ([6542bf6](https://github.com/Kit-p/json-kit/commit/6542bf6afee31b8066cc8ff66320a7986e2e482d))
* **serialize:** serialize and deserialize ([#42](https://github.com/Kit-p/json-kit/issues/42)) ([0c008fe](https://github.com/Kit-p/json-kit/commit/0c008fefcea5fb49b93c2e1aae45fab2e674abd7))
* **signature:** provide overloads for stringify and parse ([95ef4b8](https://github.com/Kit-p/json-kit/commit/95ef4b86b74195c5651784e54d471dfe12ce7a93))


### Bug Fixes

* **serialize:** add missing return type ([04577d3](https://github.com/Kit-p/json-kit/commit/04577d35dcbe2a68b22b4c86897bd8e14d3e7525))
* **types:** use namespace export for better consumption ([759eaa7](https://github.com/Kit-p/json-kit/commit/759eaa7024a0d4d91f7d4682f78626a7878d92e9))

## [1.1.1](https://github.com/Kit-p/json-kit/compare/v1.1.0...v1.1.1) (2023-03-25)

### Bug Fixes

- **stringify:** use base64url as compression output ([#33](https://github.com/Kit-p/json-kit/issues/33)) ([328c3f7](https://github.com/Kit-p/json-kit/commit/328c3f7945ff7d97c11adaad9a321f9633a22606)), closes [#32](https://github.com/Kit-p/json-kit/issues/32)

## [1.1.0](https://github.com/Kit-p/json-kit/compare/v1.0.3...v1.1.0) (2023-03-23)

### Features

- output and accept base64url instead of base64 ([#30](https://github.com/Kit-p/json-kit/issues/30)) ([f0a2362](https://github.com/Kit-p/json-kit/commit/f0a23622301192cee709f56da124db4a36e3c784))

### Bug Fixes

- **ci:** update GitHub Actions ([#29](https://github.com/Kit-p/json-kit/issues/29)) ([d7c1408](https://github.com/Kit-p/json-kit/commit/d7c1408b4f395af9295c0da029e564944376e0cd))

## [1.0.3](https://github.com/Kit-p/json-kit/compare/v1.0.2...v1.0.3) (2023-03-18)

### Bug Fixes

- **exports:** fix CommonJS export for browsers ([#24](https://github.com/Kit-p/json-kit/issues/24)) ([50f791d](https://github.com/Kit-p/json-kit/commit/50f791dbc9ed2dafb849c22c620f917b2b1a96bb))
- **ci:** remove release notes from commit message ([#26](https://github.com/Kit-p/json-kit/issues/26)) ([1aaf0a3](https://github.com/Kit-p/json-kit/commit/1aaf0a3a5d9d7c1e7c07766ab725f520536e5435))
- **ci:** replace @semantic-release/git with GitHub Actions ([#27](https://github.com/Kit-p/json-kit/issues/27)) ([cc10cde](https://github.com/Kit-p/json-kit/commit/cc10cde5096cd6e619b9ec8468638abe9fd840e1))
