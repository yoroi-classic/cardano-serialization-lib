const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
);
const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');

const cmlPackages = [
  '@dcspark/cardano-multiplatform-lib-nodejs',
  '@dcspark/cardano-multiplatform-lib-browser',
  '@dcspark/cardano-multiplatform-lib-asmjs',
];

function assertIncludesAll(text, snippets, label) {
  for (const snippet of snippets) {
    assert(
      text.includes(snippet),
      `${label} must include ${JSON.stringify(snippet)}`
    );
  }
}

assert.strictEqual(
  packageJson.private,
  true,
  'root package must stay private so this fork is not published accidentally'
);

assertIncludesAll(
  packageJson.description,
  ['Superseded', 'dcSpark cardano-multiplatform-lib'],
  'package description'
);
assertIncludesAll(packageJson.deprecated, cmlPackages, 'package deprecation');

assert(
  packageJson.publishConfig == null,
  'root package must not define publishConfig; generated packages set their own GitHub registry metadata'
);

for (const [scriptName, scriptCommand] of Object.entries(packageJson.scripts)) {
  assert(
    !/\bnpm\s+publish\b/.test(scriptCommand),
    `${scriptName} must not run npm publish directly`
  );
  assert(
    !/\bcargo\s+publish\b/.test(scriptCommand),
    `${scriptName} must not run cargo publish directly`
  );
}

assertIncludesAll(
  readme,
  [
    '## Superseded by dcSpark CML',
    'Do not publish new',
    '@yoroi-classic/cardano-serialization-lib-*',
    'https://github.com/dcSpark/cardano-multiplatform-lib',
    'https://github.com/yoroi-classic/cardano-serialization-lib/issues/3',
  ],
  'README superseded notice'
);
assertIncludesAll(readme, cmlPackages, 'README CML package list');

console.log('Superseded fork metadata guard passed.');
