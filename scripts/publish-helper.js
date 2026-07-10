const fs = require('fs');

const packageScope = '@yoroi-classic';
const packageRepository = 'git+https://github.com/yoroi-classic/cardano-serialization-lib.git';
const packageRegistry = 'https://npm.pkg.github.com';

function configurePackage(oldPkg, args) {
  const flowFile = 'cardano_serialization_lib.js.flow';
  if (oldPkg.files.find(entry => entry === flowFile) == null) {
    oldPkg.files.push(flowFile);
  }

  if (oldPkg.name === 'cardano-serialization-lib') {
    oldPkg.name = packageScope + '/' + oldPkg.name + args[0];
    const optionalArg = args[1];
    if (optionalArg) {
      oldPkg.name += optionalArg;
    }
  }

  if (args[0] === '-browser' || args[0] === '-asmjs') {
    // due to a bug in wasm-pack, this file is missing from browser builds
    const missingFile = 'cardano_serialization_lib_bg.js';
    if (oldPkg.files.find(entry => entry === missingFile) == null) {
      oldPkg.files.push(missingFile);
    }
  }

  if (args[0] === '-browser-inlined' || args[0] === '-asmjs') {
    const indexWasm = oldPkg.files.indexOf('cardano_serialization_lib_bg.wasm');
    if (indexWasm !== -1) oldPkg.files.splice(indexWasm, 1);
    const indexWasmDts = oldPkg.files.indexOf('cardano_serialization_lib_bg.wasm.d.ts');
    if (indexWasmDts !== -1) oldPkg.files.splice(indexWasmDts, 1);
  }

  if (args[0] === '-asmjs') {
    // need to replace WASM with ASM package
    oldPkg.files = [
      'cardano_serialization_lib.asm.js',
      ...oldPkg.files.filter(file => file !== 'cardano_serialization_lib_bg.wasm')
    ];
  }

  oldPkg.repository = {
    type: "git",
    url: packageRepository
  };
  oldPkg.author = "yoroi-classic contributors";
  oldPkg.license = "MIT";
  oldPkg.publishConfig = {
    registry: packageRegistry
  };

  return oldPkg;
}

if (require.main === module) {
  const oldPkg = require('../publish/package.json');
  const configuredPkg = configurePackage(oldPkg, process.argv.slice(2));
  console.log(configuredPkg);
  fs.writeFileSync('./publish/package.json', JSON.stringify(configuredPkg, null, 2));
}

module.exports = {
  configurePackage,
};
