import * as fs from 'fs';
import * as path from 'path';

/**
 * List command - List all installed Matimo tools
 * matimo list
 */
export async function listCommand(): Promise<void> {
  try {
    const nodeModulesPath = getNodeModulesPath();

    if (!nodeModulesPath) {
      console.info('❌ Error: node_modules not found');
      process.exit(1);
    }

    const matimoScope = path.join(nodeModulesPath, '@matimo');

    if (!fs.existsSync(matimoScope)) {
      console.info('⚠️  No Matimo tools installed yet');
      console.info('\nInstall some tools:');
      console.info('  matimo install slack gmail stripe');
      return;
    }

    const packages = fs.readdirSync(matimoScope).filter((dir) => !dir.startsWith('.'));

    if (packages.length === 0) {
      console.info('⚠️  No Matimo tools installed yet');
      return;
    }

    console.info('📦 Installed Matimo Packages:\n');

    for (const pkg of packages) {
      const pkgJsonPath = path.join(matimoScope, pkg, 'package.json');

      if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
        const matimo = pkgJson.matimo || {};

        console.info(`  📍 @matimo/${pkg}`);
        if (pkgJson.description) {
          console.info(`     ${pkgJson.description}`);
        }
        if (matimo.tools && Array.isArray(matimo.tools)) {
          console.info(
            `     Tools: ${matimo.tools.slice(0, 3).join(', ')}${matimo.tools.length > 3 ? ', ...' : ''}`
          );
        }
        console.info('');
      }
    }

    console.info(`Total: ${packages.length} package${packages.length > 1 ? 's' : ''} installed`);
  } catch (error) {
    console.error(
      '❌ Error listing tools:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

function getNodeModulesPath(): string | null {
  try {
    const resolved = require.resolve('@matimo/slack/package.json');
    return resolved.replace(/\/node_modules\/@matimo\/slack\/package\.json$/, '/node_modules');
  } catch {
    // Fallback
    let currentPath = process.cwd();
    for (let i = 0; i < 10; i++) {
      const nodeModules = path.join(currentPath, 'node_modules');
      if (fs.existsSync(nodeModules)) {
        return nodeModules;
      }
      currentPath = path.dirname(currentPath);
    }
    return null;
  }
}

// Export for testing
export const getNodeModulesPathForTesting = getNodeModulesPath;
