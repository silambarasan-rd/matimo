import { readFileSync } from 'fs';
import { join } from 'path';
import { installCommand } from './commands/install.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';

function getPackageVersion(): string {
  try {
    const pkgPath = join(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

export function showHelp(): void {
  console.info(`
🔨 Matimo CLI - Tool Package Manager

Usage: matimo [command] [options]

Commands:
  install <tools...>    Install tool packages
                       Example: matimo install slack gmail
  
  list                  List installed Matimo tools
                       Example: matimo list
  
  search <query>        Search for available tools
                       Example: matimo search slack
  
  help                  Show this help message
  
  version               Show version information

Examples:
  # Install new tools
  $ matimo install slack
  $ matimo install gmail stripe
  
  # List all installed tools
  $ matimo list
  
  # Search for tools
  $ matimo search email
  $ matimo search database

Documentation: https://github.com/tallclub/matimo#readme
Issues: https://github.com/tallclub/matimo/issues
`);
}

/**
 * Main CLI handler - parses commands and routes to appropriate handlers
 */
export async function main(cliArgs?: string[]): Promise<void> {
  const args = cliArgs || process.argv.slice(2);
  const command = args[0];
  const params = args.slice(1);

  if (!command) {
    showHelp();
    process.exit(0);
  }

  try {
    switch (command.toLowerCase()) {
      case 'install':
        await installCommand(params);
        break;
      case 'list':
        await listCommand();
        break;
      case 'search':
        await searchCommand(params[0] || '');
        break;
      case 'help':
      case '-h':
      case '--help':
        showHelp();
        break;
      case 'version':
      case '-v':
      case '--version':
        console.info(`matimo-cli v${getPackageVersion()}`);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.info('\nRun "matimo help" for available commands');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
