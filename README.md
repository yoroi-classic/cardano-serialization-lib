# Cardano Serialization Lib

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
