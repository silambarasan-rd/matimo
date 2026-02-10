#!/usr/bin/env node

// Simple CommonJS entry point - avoids ESM/test issues
const path = require('path');

// Check for version flag
const versionFlags = ['-v', '-V', '--version'];
if (versionFlags.includes(process.argv[process.argv.length - 1])) {
  try {
    const pkg = require(path.join(__dirname, '../package.json'));
    console.log(`matimo-cli v${pkg.version}`);
    process.exit(0);
  } catch {
    console.log('matimo-cli v unknown');
    process.exit(0);
  }
}

// Import and run the ESM main function
(async () => {
  const { main } = await import(path.join(__dirname, '../dist/cli.js'));
  await main();
})().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
