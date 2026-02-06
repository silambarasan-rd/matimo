/**
 * LangChain Integration for Matimo
 * ═════════════════════════════════════════════════════════════════════════
 *
 * Converts Matimo tool definitions to LangChain-compatible tool schemas.
 *
 * Features:
 * ✅ Automatic Zod schema generation from Matimo parameters
 * ✅ Type mapping (Matimo types → Zod types)
 * ✅ Parameter validation
 * ✅ Secret injection (API keys, tokens, etc.)
 * ✅ Result formatting for LLM consumption
 *
 * NOTE: This integration requires @langchain/core as a peer dependency.
 * Install with: npm install @langchain/core langchain
 *
 * Usage:
 * ───────────────────────────────────────────────────────────────────────
 *   import { convertToolsToLangChain } from 'matimo';
 *
 *   const matimo = await MatimoInstance.init('./tools');
 *   const tools = matimo.listTools().filter(t => t.name.startsWith('slack-'));
 *
 *   const langchainTools = convertToolsToLangChain(tools, matimo, {
 *     SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
 *   });
 *
 *   const agent = await createAgent({ model, tools: langchainTools });
 *
 */

import { z } from 'zod';
import type { ToolDefinition, Parameter } from '../core/types';
import type { MatimoInstance } from '../matimo-instance';

// Lazy load LangChain to avoid hard dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let langChainToolFn: any = null;

async function getLangChainTool() {
  if (!langChainToolFn) {
    try {
      // Dynamically import to avoid hard dependency using Function constructor
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const importFn = new Function('modulePath', 'return import(modulePath)') as any;
      const langChainModule = await importFn('@langchain/core/tools');
      langChainToolFn = langChainModule.tool;
    } catch {
      throw new Error(
        'LangChain is not installed. Install with: npm install @langchain/core langchain'
      );
    }
  }
  return langChainToolFn;
}

/**
 * LangChain tool type (generic Tool interface)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LangChainTool = any; // Tool type from @langchain/core/tools

/**
 * Convert Matimo parameter type to Zod schema
 *
 * Handles all Matimo parameter types and converts them to appropriate Zod validators.
 *
 * @param param - Matimo parameter definition
 * @returns Zod schema for the parameter
 */
function createZodSchemaForParameter(param: Parameter): z.ZodType<unknown> {
  let fieldSchema: z.ZodType<unknown>;

  // Map Matimo type to Zod type
  switch (param.type) {
    case 'string':
      fieldSchema = z.string();
      break;
    case 'number':
      fieldSchema = z.number();
      break;
    case 'boolean':
      fieldSchema = z.boolean();
      break;
    case 'array':
      if (param.items) {
        const itemsSchema = createZodSchemaForParameter(param.items);
        fieldSchema = z.array(itemsSchema);
      } else {
        fieldSchema = z.array(z.unknown());
      }
      break;
    case 'object':
      if (param.properties) {
        const propSchemas: Record<string, z.ZodType<unknown>> = {};
        Object.entries(param.properties).forEach(([key, prop]) => {
          propSchemas[key] = createZodSchemaForParameter(prop);
        });
        fieldSchema = z.object(propSchemas);
      } else {
        fieldSchema = z.record(z.string(), z.unknown());
      }
      break;
    default:
      fieldSchema = z.unknown();
  }

  // Add description if available
  if (param.description) {
    fieldSchema = fieldSchema.describe(param.description);
  }

  // Add enum constraint if available
  if (param.enum && param.enum.length > 0 && param.type === 'string') {
    const enumValues = param.enum as string[];
    if (enumValues.length === 1) {
      fieldSchema = z.literal(enumValues[0]);
    } else if (enumValues.length > 1) {
      fieldSchema = z.enum(enumValues as [string, ...string[]]);
    }
    // Note: z.enum only works with string literals, so we can't easily apply to other types
  }

  // Make optional if not required
  if (!param.required) {
    fieldSchema = fieldSchema.optional();
  }

  return fieldSchema;
}

/**
 * Build Zod object schema from Matimo tool parameters
 *
 * Filters out internal parameters (those matching pattern MATIMO_* or provider tokens)
 * and creates a Zod schema for LangChain.
 *
 * @param tool - Matimo tool definition
 * @param secretParamNames - Parameters that are secrets (will be auto-injected)
 * @returns Zod object schema
 */
function buildZodSchema(
  tool: ToolDefinition,
  secretParamNames: Set<string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): z.ZodObject<any> {
  const schemaShape: Record<string, z.ZodType<unknown>> = {};

  // Handle tools with no parameters
  if (!tool.parameters) {
    return z.object({});
  }

  Object.entries(tool.parameters).forEach(([paramName, param]) => {
    // Skip secret parameters - they'll be injected automatically
    if (secretParamNames.has(paramName)) {
      return;
    }

    // Skip internal Matimo parameters
    if (paramName.startsWith('MATIMO_')) {
      return;
    }

    schemaShape[paramName] = createZodSchemaForParameter(param);
  });

  return z.object(schemaShape);
}

/**
 * Format tool execution result for LLM consumption
 *
 * Takes the raw Matimo execution result and formats it nicely for the LLM
 * to understand and reason about.
 *
 * @param result - Raw result from matimo.execute()
 * @returns Formatted string suitable for LLM
 */
function formatResultForLLM(result: unknown): string {
  if (result === null || result === undefined) {
    return 'No result returned.';
  }

  if (typeof result === 'string') {
    return result;
  }

  if (typeof result !== 'object') {
    return String(result);
  }

  const obj = result as Record<string, unknown>;

  // Special handling for common response patterns
  if ('ok' in obj && obj.ok === true) {
    return 'Operation completed successfully.';
  }

  if ('error' in obj) {
    return `Error: ${obj.error}`;
  }

  if ('items' in obj && Array.isArray(obj.items)) {
    const items = obj.items as unknown[];
    const count = items.length;
    if (count === 0) {
      return 'No items found.';
    }
    return `Found ${count} item(s). First result: ${JSON.stringify(items[0], null, 2)}`;
  }

  if ('messages' in obj && Array.isArray(obj.messages)) {
    const messages = obj.messages as unknown[];
    const count = messages.length;
    if (count === 0) {
      return 'No messages found.';
    }
    return `Found ${count} message(s). First: ${JSON.stringify(messages[0], null, 2)}`;
  }

  if ('channels' in obj && Array.isArray(obj.channels)) {
    const channels = obj.channels as unknown[];
    const count = channels.length;
    if (count === 0) {
      return 'No channels found.';
    }
    return `Found ${count} channel(s). First: ${JSON.stringify(channels[0], null, 2)}`;
  }

  if ('data' in obj) {
    return `Result: ${JSON.stringify(obj.data, null, 2)}`;
  }

  // Default: return first 2 key-value pairs
  const entries = Object.entries(obj).slice(0, 2);
  return `Result: ${JSON.stringify(Object.fromEntries(entries), null, 2)}`;
}

/**
 * Convert a single Matimo tool to LangChain format
 *
 * Creates a LangChain-compatible tool that can be used with agents like Claude.
 *
 * @param matimo - MatimoInstance for executing tools
 * @param toolDef - Matimo tool definition
 * @param secrets - Secret values to inject (API keys, tokens, etc.)
 * @returns LangChain tool
 */
async function convertSingleTool(
  matimo: MatimoInstance,
  toolDef: ToolDefinition,
  secrets: Record<string, string>
): Promise<LangChainTool> {
  // Determine which parameters are secrets (will be auto-injected)
  const secretParamNames = new Set<string>();
  if (toolDef.parameters) {
    Object.keys(toolDef.parameters).forEach((paramName) => {
      // Common secret parameter patterns
      if (
        paramName.toUpperCase().includes('TOKEN') ||
        paramName.toUpperCase().includes('KEY') ||
        paramName.toUpperCase().includes('SECRET') ||
        paramName.toUpperCase().includes('PASSWORD') ||
        paramName === 'SLACK_BOT_TOKEN' ||
        paramName === 'GMAIL_ACCESS_TOKEN' ||
        paramName === 'GITHUB_TOKEN' ||
        paramName === 'STRIPE_API_KEY'
      ) {
        secretParamNames.add(paramName);
      }
    });
  }

  // Build Zod schema without secret parameters
  const zodSchema = buildZodSchema(toolDef, secretParamNames);

  // Create the LangChain tool
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toolFn: any = await getLangChainTool();
  return toolFn(
    async (input: Record<string, unknown>) => {
      try {
        // Build complete parameters by injecting secrets
        const params: Record<string, unknown> = { ...input };

        // Inject secrets into parameters
        secretParamNames.forEach((paramName) => {
          if (paramName in secrets) {
            params[paramName] = secrets[paramName];
          }
        });

        // Execute tool via Matimo
        const result = await matimo.execute(toolDef.name, params);

        // Format result for LLM consumption
        return formatResultForLLM(result);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Tool execution failed: ${errorMsg}`);
      }
    },
    {
      name: toolDef.name,
      description: toolDef.description || `Tool: ${toolDef.name}`,
      schema: zodSchema,
    }
  );
}

/**
 * Convert Matimo tools to LangChain format
 *
 * Batch converts multiple Matimo tool definitions to LangChain-compatible tools.
 * Handles Zod schema generation, parameter validation, and secret injection.
 *
 * @param tools - Array of Matimo tool definitions
 * @param matimo - MatimoInstance for executing tools
 * @param secrets - Secret values to inject (API keys, tokens, etc.)
 * @returns Array of LangChain tools ready for use with agents
 *
 * @example
 * ```typescript
 * const matimo = await MatimoInstance.init('./tools');
 * const slackTools = matimo.listTools()
 *   .filter(t => t.name.startsWith('slack-'));
 *
 * const langchainTools = await convertToolsToLangChain(slackTools, matimo, {
 *   SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
 * });
 *
 * const agent = await createAgent({
 *   model: new ChatOpenAI({ modelName: 'gpt-4o-mini' }),
 *   tools: langchainTools,
 * });
 * ```
 */
export async function convertToolsToLangChain(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: any[],
  matimo: MatimoInstance,
  secrets: Record<string, string> = {}
): Promise<LangChainTool[]> {
  return Promise.all(tools.map((toolDef) => convertSingleTool(matimo, toolDef, secrets)));
}
