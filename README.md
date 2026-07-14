# Cardano Serialization Lib

## Superseded by dcSpark CML

This Yoroi Classic fork is no longer the long-term dependency target. New work
should use dcSpark Cardano Multiplatform Lib instead:

- https://github.com/dcSpark/cardano-multiplatform-lib
- `@dcspark/cardano-multiplatform-lib-nodejs`
- `@dcspark/cardano-multiplatform-lib-browser`
- `@dcspark/cardano-multiplatform-lib-asmjs` only when ASM.js support is unavoidable

These npm package names and entry metadata were verified against npm before this
notice was added. The nodejs and browser packages currently expose
`cardano_multiplatform_lib.js` with `cardano_multiplatform_lib.d.ts` types; they
are migration targets, not drop-in replacements for this fork's CSL module names.
dcSpark labels the ASM.js package as strongly discouraged, so prefer the nodejs
or browser WASM packages and keep ASM.js limited to consumers that cannot run
WASM.

Keep any already pushed Yoroi Classic compatibility refs only as a temporary
bridge while downstream consumers migrate. Do not publish new
`@yoroi-classic/cardano-serialization-lib-*` packages to npm.

Tracking issue: https://github.com/yoroi-classic/cardano-serialization-lib/issues/3

### Downstream CML migration tracking

Use the downstream issues below to move consumers to CML. Avoid adding new
consumers to this fork unless a temporary compatibility bridge is explicitly
needed for one of those migrations.

- Extension: https://github.com/yoroi-classic/yoroi-frontend/issues/15
- Mobile: https://github.com/yoroi-classic/yoroi/issues/14
- Backend: https://github.com/yoroi-classic/yoroi-graphql-migration-backend/issues/4
- Trezor flow package: https://github.com/yoroi-classic/trezor-connect-flow/issues/2

This is a library, written in Rust, for serialization & deserialization of data structures used in Cardano's Haskell implementation of Alonzo along with useful utility functions.

##### JavaScript packages

- `@yoroi-classic/cardano-serialization-lib-nodejs`
- `@yoroi-classic/cardano-serialization-lib-browser`
- `@yoroi-classic/cardano-serialization-lib-asmjs`

These package names are generated from this repository for owned Git refs or owned package registries. Do not publish them to npmjs.

##### JavaScript packages with GC support
Note: This package uses [weak references flag from wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/reference/weak-references.html).
It uses `FinalizationRegistry` under the hood to automatically call "free" for each CSL struct when it is no longer needed. However, use this feature with caution as it may have unpredictable behaviors.
- `@yoroi-classic/cardano-serialization-lib-nodejs-gc`
- `@yoroi-classic/cardano-serialization-lib-browser-gc`
- `@yoroi-classic/cardano-serialization-lib-asmjs-gc`


##### Rust crates

- [cardano-serialization-lib](https://crates.io/crates/cardano-serialization-lib)

##### Mobile bindings

- [React-Native mobile bindings](https://github.com/yoroi-classic/csl-mobile-bridge)

## Documentation

You can find documentation [here](https://developers.cardano.org/docs/get-started/cardano-serialization-lib/overview)
