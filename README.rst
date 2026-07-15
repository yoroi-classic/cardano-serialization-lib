Cardano Serialization Lib
=========================

.. warning::

   This Yoroi Classic fork is superseded by dcSpark Cardano Multiplatform
   Lib. New work should target
   https://github.com/dcSpark/cardano-multiplatform-lib instead of new
   ``@yoroi-classic/cardano-serialization-lib-*`` package publishing.

This is a library for serialization & deserialization of data structures
used in Cardano’s Haskell implementation of Alonzo along with useful
utility functions.

How can I use this library
--------------------------

Rust is wonderfully portable! You can easily bind to the native Rust
library from any common programming language (even C and WebAssembly)!

JavaScript packages
'''''''''''''''''''

-  ``@yoroi-classic/cardano-serialization-lib-nodejs``
-  ``@yoroi-classic/cardano-serialization-lib-browser``
-  ``@yoroi-classic/cardano-serialization-lib-asmjs``

These package names are generated from this repository for owned Git refs
or owned package registries. Do not publish them to npmjs.

Mobile bindings
'''''''''''''''

-  `React-Native mobile bindings`_

Benefits of using this library
------------------------------

Serialization/deserialization code is automatically generated from
Cardano’s official specification, which guarantees it can easily stay up
to date! The same code-generation approach can be re-used for other tasks
such as automatically generating a Rust library for Cardano metadata
specifications.

It is also very easy to create scripts in Rust or WASM to share with
stake pools, or even embed inside an online tool! No more crazy
cardano-cli bash scripts!

Powerful and flexible enough to be used to power wallets and exchanges!
(Yes, it’s used in production!)

Documentation
-------------

This library generates both `Typescript`_ and `Flow`_ type definitions,
so it’s often easiest to see what is possible by just looking at the
types! You can find the Flow types `here`_

You can also look in the `example`_ folder to see how to use this
library from Typescript or just experiment with the library.

What about other versions of Cardano?
-------------------------------------

If you are looking for legacy bindings, you can find them at the
following:

-  `Byron WASM bindings`_

Original binary specifications
------------------------------

Here are the location of the original `CDDL`_ specifications:

- Alonzo:
   `link <https://github.com/input-output-hk/cardano-ledger/tree/master/eras/alonzo/test-suite/cddl-files>`__
-  Shelley:
   `link <https://github.com/input-output-hk/cardano-ledger/tree/master/eras/shelley/test-suite/cddl-files>`__
-  Mary:
   `link <https://github.com/input-output-hk/cardano-ledger/tree/master/eras/shelley-ma/test-suite/cddl-files>`__
-  Byron:
   `link <https://github.com/input-output-hk/cardano-ledger/tree/master/eras/byron/cddl-spec>`__

Building
--------

If you need to install Rust, do the following:

::

   curl https://sh.rustup.rs -sSf | sh -s -- -y
   echo 'export PATH=$HOME/.cargo/bin/:$PATH' >> $BASH_ENV
   rustup install stable
   rustup target add wasm32-unknown-unknown --toolchain stable
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

To build this repository, do the following:

::

   git submodule update --init --recursive
   nvm use
   npm install
   npm run rust:build-nodejs

Testing
-------

::

   npm run rust:test

Publishing
----------

Publishing from this fork is disabled. New work should migrate to dcSpark
Cardano Multiplatform Lib instead of releasing new
``@yoroi-classic/cardano-serialization-lib-*`` packages or Rust crates from
this repository.

The legacy release helper exits before doing any work, and the package scripts
route publish commands through the disabled publishing guard. Keep any already
pushed Yoroi Classic compatibility refs only as temporary migration bridges.

Archive this fork after downstream consumers have completed their CML
migrations and no temporary compatibility ref is still required.

.. _React-Native mobile bindings: https://github.com/yoroi-classic/csl-mobile-bridge
.. _Typescript: https://www.typescriptlang.org/
.. _Flow: https://flow.org/
.. _here: /rust/pkg/cardano_serialization_lib.js.flow
.. _example: /example
.. _Byron WASM bindings: https://github.com/input-output-hk/js-cardano-wasm/tree/master/cardano-wallet
.. _CDDL: http://cbor.io/tools.html
.. _link: https://github.com/input-output-hk/cardano-ledger-specs/tree/master/byron/cddl-spec
