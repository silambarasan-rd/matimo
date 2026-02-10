/**
 * Search command - Search for available Matimo packages
 * matimo search slack
 */
export async function searchCommand(query: string): Promise<void> {
  if (!query) {
    console.error('❌ Error: Please specify a search query');
    console.info('\nUsage: matimo search <query>');
    console.info('Example: matimo search slack');
    process.exit(1);
  }

  // Available packages (hardcoded for now, can be extended)
  const availablePackages = [
    {
      name: 'slack',
      description: 'Slack workspace tools - send messages, list channels, manage reactions',
      tools: 18,
    },
    {
      name: 'gmail',
      description: 'Gmail tools - send emails, list messages, manage drafts',
      tools: 6,
    },
    {
      name: 'database',
      description: 'Database tools - query, insert, update, delete operations',
      tools: 5,
    },
    {
      name: 'hubspot',
      description: 'HubSpot CRM tools - manage contacts and deals',
      tools: 5,
    },
    {
      name: 'whatsapp',
      description: 'WhatsApp messaging tools - send messages, manage media',
      tools: 4,
    },
    {
      name: 'firebase',
      description: 'Firebase tools - read, write, and query data',
      tools: 5,
    },
  ];

  const q = query.toLowerCase();
  const results = availablePackages.filter(
    (pkg) => pkg.name.includes(q) || pkg.description.toLowerCase().includes(q)
  );

  if (results.length === 0) {
    console.info(`❌ No packages found matching "${query}"`);
    console.info('\nAvailable packages:');
    availablePackages.forEach((pkg) => {
      console.info(`  • @matimo/${pkg.name} (${pkg.tools} tools)`);
    });
    return;
  }

  console.info(`🔍 Search results for "${query}":\n`);

  for (const pkg of results) {
    console.info(`📦 @matimo/${pkg.name}`);
    console.info(`   ${pkg.description}`);
    console.info(`   Tools: ${pkg.tools}`);
    console.info(`   Install: matimo install ${pkg.name}\n`);
  }

  console.info(`Total: ${results.length} package${results.length > 1 ? 's' : ''} found`);
}
