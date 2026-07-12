const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const helperPath = path.join(rootDir, 'scripts', 'build-helper.js');
const helperSource = fs.readFileSync(helperPath, 'utf8');
const {
  handlePackagePublish,
  legacyPublishDisabledMessage,
  publishAllPackages,
} = require('./build-helper');

function assertPublishDisabled(action) {
  assert.throws(action, error => {
    assert.match(error.message, /Legacy Yoroi Classic CSL publishing is disabled/);
    assert.match(error.message, /dcSpark cardano-multiplatform-lib/);
    return true;
  });
}

assert.strictEqual(
  legacyPublishDisabledMessage.includes('cardano-multiplatform-lib'),
  true
);
assertPublishDisabled(() => publishAllPackages('beta', false));
assertPublishDisabled(() => handlePackagePublish(
  { target: 'nodejs', variant: 'normal', gc: false },
  'beta',
  { dryRun: false }
));

assert(
  !/npm publish(?![^\n]*--dry-run)/.test(helperSource),
  'build-helper must not contain a non-dry-run npm publish command'
);
assert(
  !/cargo publish(?![^\n]*--dry-run)/.test(helperSource),
  'build-helper must not contain a non-dry-run cargo publish command'
);
