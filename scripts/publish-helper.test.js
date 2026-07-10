const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publishDir = path.join(rootDir, 'publish');
const { configurePackage } = require('./publish-helper');

const basePackage = {
  name: 'cardano-serialization-lib',
  version: '15.0.3',
  files: [
    'cardano_serialization_lib_bg.wasm',
    'cardano_serialization_lib_bg.wasm.d.ts',
  ],
};

function runHelper(args) {
  fs.rmSync(publishDir, { recursive: true, force: true });
  fs.mkdirSync(publishDir, { recursive: true });

  return configurePackage(JSON.parse(JSON.stringify(basePackage)), args);
}

function assertOwnedMetadata(pkg, expectedName) {
  assert.strictEqual(pkg.name, expectedName);
  assert.deepStrictEqual(pkg.repository, {
    type: 'git',
    url: 'git+https://github.com/yoroi-classic/cardano-serialization-lib.git',
  });
  assert.strictEqual(pkg.author, 'yoroi-classic contributors');
  assert.deepStrictEqual(pkg.publishConfig, {
    registry: 'https://npm.pkg.github.com',
  });
  assert(pkg.files.includes('cardano_serialization_lib.js.flow'));
}

try {
  assert.throws(
    () => runHelper([]),
    /Unsupported package suffix: <missing>/
  );

  assert.throws(
    () => runHelper(['-bad']),
    /Unsupported package suffix: -bad/
  );

  assert.throws(
    () => runHelper(['-nodejs', '-bad']),
    /Unsupported optional package suffix: -bad/
  );

  assert.throws(
    () => runHelper(['-nodejs', '-gc', '-extra']),
    /Unexpected publish helper arguments: -extra/
  );

  assertOwnedMetadata(
    runHelper(['-nodejs']),
    '@yoroi-classic/cardano-serialization-lib-nodejs'
  );

  assertOwnedMetadata(
    runHelper(['-nodejs', '-gc']),
    '@yoroi-classic/cardano-serialization-lib-nodejs-gc'
  );

  const browserPkg = runHelper(['-browser']);
  assertOwnedMetadata(
    browserPkg,
    '@yoroi-classic/cardano-serialization-lib-browser'
  );
  assert(browserPkg.files.includes('cardano_serialization_lib_bg.js'));

  const asmPkg = runHelper(['-asmjs']);
  assertOwnedMetadata(
    asmPkg,
    '@yoroi-classic/cardano-serialization-lib-asmjs'
  );
  assert(asmPkg.files.includes('cardano_serialization_lib.asm.js'));
  assert(!asmPkg.files.includes('cardano_serialization_lib_bg.wasm'));
} finally {
  fs.rmSync(publishDir, { recursive: true, force: true });
}
