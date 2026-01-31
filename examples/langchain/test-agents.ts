#!/usr/bin/env node
/**
 * Test script to verify both agents can load tools correctly
 * Run: tsx test-agents.ts
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { ToolLoader, MatimoInstance } from 'matimo';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testDecoratorPattern() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Testing Decorator Pattern (ToolLoader)            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    const toolsPath = path.resolve(__dirname, '../../tools');
    const loader = new ToolLoader();

    const toolsMap = await loader.loadToolsFromDirectory(toolsPath);
    const tools = Array.from(toolsMap.values());

    console.log(`✓ Loaded ${tools.length} tools\n`);

    tools.forEach((t) => {
      if (t.execution && t.parameters) {
        console.log(`  📦 ${t.name}`);
        console.log(`     ${t.description}`);
      }
    });

    return true;
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testFactoryPattern() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Testing Factory Pattern (MatimoInstance.init)      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    const toolsPath = path.resolve(__dirname, '../../tools');
    const matimo = await MatimoInstance.init(toolsPath);

    const tools = matimo.listTools();

    console.log(`✓ Loaded ${tools.length} tools\n`);

    tools.forEach((t) => {
      if (t.execution && t.parameters) {
        console.log(`  📦 ${t.name}`);
        console.log(`     ${t.description}`);
      }
    });

    return true;
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  console.log('\n🧪 Testing Both Agent Patterns\n');

  const decoratorOk = await testDecoratorPattern();
  const factoryOk = await testFactoryPattern();

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    Test Results                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (decoratorOk) {
    console.log('✅ Decorator Pattern: PASS');
  } else {
    console.log('❌ Decorator Pattern: FAIL');
  }

  if (factoryOk) {
    console.log('✅ Factory Pattern: PASS\n');
  } else {
    console.log('❌ Factory Pattern: FAIL\n');
  }

  if (decoratorOk && factoryOk) {
    console.log('✅ All tests passed! Both agents can load tools correctly.\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please check the errors above.\n');
    process.exit(1);
  }
}

main().catch(console.error);
