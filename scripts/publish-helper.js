const fs = require('fs');

const packageScope = '@yoroi-classic';
const packageRepository = 'git+https://github.com/yoroi-classic/cardano-serialization-lib.git';
const packageRegistry = 'https://npm.pkg.github.com';
const packageDeprecatedMessage = 'This Yoroi Classic CSL fork is superseded. Use @dcspark/cardano-multiplatform-lib-nodejs or @dcspark/cardano-multiplatform-lib-browser; use @dcspark/cardano-multiplatform-lib-asmjs only when unavoidable because dcSpark strongly discourages ASM.js.';
const supportedPackageSuffixes = new Set([
  '-nodejs',
  '-browser',
  '-browser-inlined',
  '-asmjs',
]);
const supportedOptionalSuffixes = new Set(['-gc']);

function validatePackageArgs(args) {
  const [packageSuffix, optionalSuffix, ...extraArgs] = args;

  if (!supportedPackageSuffixes.has(packageSuffix)) {
    throw new Error(
      `Unsupported package suffix: ${packageSuffix || '<missing>'}. ` +
        `Expected one of ${Array.from(supportedPackageSuffixes).join(', ')}.`
    );
  }

  if (
    optionalSuffix != null &&
    !supportedOptionalSuffixes.has(optionalSuffix)
  ) {
    throw new Error(
      `Unsupported optional package suffix: ${optionalSuffix}. ` +
        `Expected one of ${Array.from(supportedOptionalSuffixes).join(', ')}.`
    );
  }

  if (extraArgs.length > 0) {
    throw new Error(
      `Unexpected publish helper arguments: ${extraArgs.join(', ')}.`
    );
  }
}

function configurePackage(oldPkg, args) {
  validatePackageArgs(args);

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
  oldPkg.deprecated = packageDeprecatedMessage;
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
  packageDeprecatedMessage,
  validatePackageArgs,
};
