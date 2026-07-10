#!/usr/bin/env node

/**
 * Cardano Serialization Library Build Helper
 * 
 * Supports local compatibility actions:
 * - build: Build for specific target/variant
 * - test-publish: Dry-run the legacy publishing pipeline
 * 
 * All parameters are REQUIRED - no defaults provided to prevent accidental builds.
 */

const { Command } = require('commander');
const { execSync } = require('child_process');
const fs = require('fs');

const program = new Command();
const legacyPublishDisabledMessage = [
  'Legacy Yoroi Classic CSL publishing is disabled.',
  'This fork is superseded by dcSpark cardano-multiplatform-lib.',
  'Move consumers to @dcspark/cardano-multiplatform-lib-nodejs,',
  '@dcspark/cardano-multiplatform-lib-browser, or',
  '@dcspark/cardano-multiplatform-lib-asmjs only when ASM.js is unavoidable.',
].join('\n');

function stopLegacyPublish() {
  console.error(`\n${legacyPublishDisabledMessage}`);
  process.exit(1);
}

program
  .name('build-helper')
  .description('Cardano Serialization Library Build Helper\n\nExamples:\n  build-helper build --target browser --variant normal --gc false\n  build-helper test-publish --env beta')
  .version('1.0.0');

// Build command
program
  .command('build')
  .description('Build for specific target/variant\n\nExample: build --target browser --variant normal --gc false')
  .requiredOption('-t, --target <target>', 'Target platform (nodejs|browser|web)', (value) => {
    if (!['nodejs', 'browser', 'web'].includes(value)) {
      throw new Error('Target must be: nodejs, browser, or web');
    }
    return value;
  })
  .requiredOption('-v, --variant <variant>', 'Build variant (normal|inlined|asm)', (value) => {
    if (!['normal', 'inlined', 'asm'].includes(value)) {
      throw new Error('Variant must be: normal, inlined, or asm');
    }
    return value;
  })
  .requiredOption('-g, --gc <gc>', 'Enable garbage collection (true|false)', (value) => {
    if (value !== 'true' && value !== 'false') {
      throw new Error('GC must be: true or false');
    }
    return value === 'true';
  })
  .action((options) => {
    buildRust(options.target, options.variant, options.gc);
    console.log(`\n✅ Build completed successfully!`);
  });

// Publish command  
program
  .command('publish')
  .description('Deprecated: legacy CSL package publishing is disabled')
  .allowUnknownOption(true)
  .allowExcessArguments(true)
  .action(() => {
    stopLegacyPublish();
  });

// Publish-all command
program
  .command('publish-all')
  .description('Deprecated: legacy CSL package publishing is disabled')
  .allowUnknownOption(true)
  .allowExcessArguments(true)
  .action(() => {
    stopLegacyPublish();
  });

// Shared disabled command for legacy package scripts that used to publish directly.
program
  .command('publish-disabled')
  .description('Explain why legacy CSL publishing is disabled')
  .action(() => {
    stopLegacyPublish();
  });

// Test-publish command
program
  .command('test-publish')
  .description('Test the publishing pipeline without actually publishing\n\nRuns all build steps and validates packages using npm pack and --dry-run\n\nExample: test-publish --env beta')
  .requiredOption('-e, --env <env>', 'Environment (prod|beta)', (value) => {
    if (!['prod', 'beta'].includes(value)) {
      throw new Error('Environment must be: prod or beta');
    }
    return value;
  })
  .action((options) => {
    testPublishAllPackages(options.env);
  });

function run(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    process.exit(1);
  }
}

function buildRust(target, variant, gc) {
  // Clean
  run('npx rimraf ./rust/pkg', 'Cleaning pkg directory');
  
  // Build
  const buildCmd = gc 
    ? `cd rust && WASM_BINDGEN_WEAKREF=1 wasm-pack build --target=${target}`
    : `cd rust && wasm-pack build --target=${target}`;
  
  run(buildCmd, `Building Rust for ${target}${gc ? ' (with GC)' : ''}`);
  
  // Post-build steps based on variant
  run('npm run js:ts-json-gen', 'Generating TypeScript definitions');
  
  if (variant === 'inlined') {
    run('npm run wasm:inline', 'Inlining WASM');
    run('npm run wasm:delete-wasm-files', 'Cleaning up WASM files');
  } else if (variant === 'asm') {
    run('npm run asm:build', 'Building ASM.js version');
  }
  
  run('cd rust && wasm-pack pack', 'Packing Rust build');
  run('npm run js:flowgen', 'Generating Flow types');
}

function checkVersionExists(packageName, version, registry) {
  try {
    const registryArg = registry ? ` --registry=${registry}` : '';
    const result = execSync(`npm view ${packageName}@${version} version${registryArg} 2>/dev/null`, {
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    return result.trim() === version;
  } catch (error) {
    // Package or version doesn't exist
    return false;
  }
}

function getPackageInfo(packageJsonPath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return {
      name: packageJson.name,
      version: packageJson.version,
      registry: packageJson.publishConfig?.registry
    };
  } catch (error) {
    console.error(`❌ Failed to read package.json from ${packageJsonPath}`);
    return null;
  }
}

function handlePackagePublish(config, env, options = {}) {
  const { dryRun = false, runTests = false } = options;
  const { target, variant, gc } = config;
  const publishTag = env === 'beta' ? '--tag beta' : '';
  
  // Build first
  buildRust(target, variant, gc);

  // Run tests if requested
  if (runTests) {
    run('npm run rust:test', 'Running Rust tests');
  }
  
  // Prepare publish
  run('npm run js:prepublish', 'Preparing for publish');
  
  // Configure package
  let targetSuffix = variant === 'normal' ? target : `${target}-${variant}`;
  if(targetSuffix === 'browser-asm') {
    targetSuffix = "asmjs"
  }
  const gcSuffix = gc ? ' -gc' : '';
  const helperCmd = `node ./scripts/publish-helper -${targetSuffix}${gcSuffix}`;
  
  run(helperCmd, 'Configuring package for publish');
  
  // Check if version already exists
  let skipPublish = false;
  const packageInfo = getPackageInfo('./publish/package.json');
  if (packageInfo) {
    const registryLabel = packageInfo.registry || 'default npm registry';
    console.log(`\n🔍 Checking if ${packageInfo.name}@${packageInfo.version} already exists in ${registryLabel}...`);
    
    if (checkVersionExists(packageInfo.name, packageInfo.version, packageInfo.registry)) {
      if (dryRun) {
        console.log(`\n⚠️  Package ${packageInfo.name}@${packageInfo.version} already exists in ${registryLabel}.`);
        console.log(`   In a real publish, this would require a version bump.`);
      } else {
        console.log(`\n⚠️  WARNING: Package ${packageInfo.name}@${packageInfo.version} already exists in ${registryLabel}!`);
        console.log(`   Please bump the version in package.json before publishing.`);
        console.log(`\n❌ Publish will be skipped.`);
        skipPublish = true;
      }
    } else {
      console.log(`✅ Version ${packageInfo.version} is available for publishing.`);
    }
  }
  
  if (skipPublish && !dryRun) {
    console.log(`\n⚠️  Skipping publish due to existing version.`);
    return;
  }

  // Publish or test publish
  if (dryRun) {
    run(`cd publish && npm publish ${publishTag} --access public --dry-run`, `Testing package publish${env === 'beta' ? ' (beta)' : ''} (dry-run)`);
    run(`cd publish && npm pack`, 'Creating package tarball');
  } else {
    run(`cd publish && npm publish ${publishTag} --access public`, `Publishing package${env === 'beta' ? ' (beta)' : ''}`);
  }
}

function publishAllPackages(env, dryRun = false) {
  const workflowType = dryRun ? 'test publish' : 'publish';
  console.log(`\n🚀 Starting full ${workflowType} workflow for ${env} environment...\n`);
  
  // Step 1: Run all tests and checks
  console.log(`\n🧪 Step 1: Running tests and checks...`);
  
  // Run Rust tests (using existing script)
  run('npm run rust:test', 'Running Rust tests');
  
  // Run Rust warnings check (using existing script)  
  run('npm run rust:check-warnings', 'Checking Rust warnings');
  
  // Step 2: Build and publish/test all variants
  console.log(`\n📦 Step 2: ${dryRun ? 'Testing publish' : 'Building and publishing'} all JavaScript packages...`);
  
  const buildConfigs = [
    { target: 'nodejs', variant: 'normal', gc: false },
    { target: 'nodejs', variant: 'normal', gc: true },
    { target: 'browser', variant: 'normal', gc: false },
    { target: 'browser', variant: 'normal', gc: true },
    { target: 'browser', variant: 'inlined', gc: false },
    { target: 'browser', variant: 'inlined', gc: true },
    { target: 'browser', variant: 'asm', gc: false },
    { target: 'browser', variant: 'asm', gc: true }
  ];
  
  const results = [];
  
  for (const config of buildConfigs) {
    const configName = `${config.target}-${config.variant}${config.gc ? '-gc' : ''}`;
    console.log(`\n📦 ${dryRun ? 'Testing' : 'Publishing'} ${configName}...`);
    
    try {
      handlePackagePublish(config, env, { dryRun });
      console.log(`✅ Successfully ${dryRun ? 'tested' : 'published'} ${configName}`);
      results.push({ config: configName, status: 'success' });
    } catch (error) {
      console.error(`❌ Failed to ${dryRun ? 'test' : 'publish'} ${configName}: ${error.message}`);
      results.push({ config: configName, status: 'failed', error: error.message });
      // Continue with other packages rather than failing completely
    }
  }
  
  // Step 3: Publish/test Rust crate
  console.log(`\n🦀 Step 3: ${dryRun ? 'Testing Rust crate publish' : 'Publishing Rust crate'}...`);
  try {
    if (dryRun) {
      run('cd rust && cargo publish --dry-run --allow-dirty', 'Testing Rust crate publish (dry-run)');
    } else {
      run('cd rust && cargo publish --allow-dirty', 'Publishing Rust crate to crates.io');
    }
    console.log(`✅ Successfully ${dryRun ? 'tested' : 'published'} Rust crate`);
    results.push({ config: 'rust-crate', status: 'success' });
  } catch (error) {
    console.error(`❌ Failed to ${dryRun ? 'test' : 'publish'} Rust crate: ${error.message}`);
    if (!dryRun) {
      console.log(`   This might be because the version already exists on crates.io`);
    }
    results.push({ config: 'rust-crate', status: 'failed', error: error.message });
  }
  
  // Summary
  console.log(`\n📊 ${dryRun ? 'Test Publish' : 'Publish'} Summary:`);
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach(r => console.log(`   - ${r.config}`));
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`   - ${r.config}: ${r.error}`));
  }
  
  console.log(`\n🎉 Full ${workflowType} workflow completed!`);
  if (dryRun) {
    console.log(`\nActual legacy CSL publishing is disabled. Move consumers to dcSpark cardano-multiplatform-lib packages instead.`);
  }
}

function testPublishAllPackages(env) {
  publishAllPackages(env, true);
}

// Parse arguments and execute commands
program.parse(process.argv);
