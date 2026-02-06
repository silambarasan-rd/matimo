/**
 * LangChain Integration for Matimo
 *
 * Converts Matimo tools to LangChain-compatible format.
 * Simple, lightweight, scales to 2000+ tools.
 *
 * NOTE: Requires @langchain/core as peer dependency.
 * Install with: npm install @langchain/core langchain
 *
 * Usage:
 *   const matimo = await MatimoInstance.init('./tools');
 *   const langchainTools = await convertToolsToLangChain(
 *     matimo.listTools(),
 *     matimo,
 *     { SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN }
 *   );
 */

import { z } from 'zod';
import type { ToolDefinition, Parameter } from '../core/types';
import type { MatimoInstance } from '../matimo-instance';

// LangChain tool type - dynamically imported to avoid hard dependency
export interface LangChainTool {
  name: string;
  description: string;
  schema: z.ZodSchema;
  invoke: (input: Record<string, unknown>) => Promise<unknown>;
}

// Lazy load LangChain to avoid hard dependency
let langChainToolFn: ((
  fn: (input: Record<string, unknown>) => Promise<unknown>,
  options: {
    name: string;
    description: string;
    schema: z.ZodSchema;
  }
) => LangChainTool) | null = null;

async function getLangChainTool(): Promise<
  (
    fn: (input: Record<string, unknown>) => Promise<unknown>,
    options: {
      name: string;
      description: string;
      schema: z.ZodSchema;
    }
  ) => LangChainTool
> {
  if (!langChainToolFn) {
    try {
      const langChainModule = await import('@langchain/core/tools');
      langChainToolFn = langChainModule.tool;
    } catch {
      throw new Error('LangChain not installed. Install: npm install @langchain/core langchain');
    }
  }
  return langChainToolFn;
}

/**
 * Convert parameter to Zod schema
 */
function parameterToZod(param: Parameter): z.ZodType<unknown> {
  let schema: z.ZodType<unknown>;

  switch (param.type) {
    case 'string':
      schema = z.string();
      break;
    case 'number':
      schema = z.number();
      break;
    case 'boolean':
      schema = z.boolean();
      break;
    case 'array': {
      const itemSchema = param.items ? parameterToZod(param.items) : z.unknown();
      schema = z.array(itemSchema);
      break;
    }
    case 'object': {
      if (param.properties) {
        const props: Record<string, z.ZodType<unknown>> = {};
        for (const [key, prop] of Object.entries(param.properties)) {
          props[key] = parameterToZod(prop);
        }
        schema = z.object(props);
      } else {
        schema = z.record(z.string(), z.unknown());
      }
      break;
    }
    default:
      schema = z.unknown();
  }

  if (param.description) {
    schema = schema.describe(param.description);
  }

  if (!param.required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Build Zod schema for tool input, excluding secret parameters
 */
function buildInputSchema(
  tool: ToolDefinition,
  secretParams: Set<string>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  if (!tool.parameters) {
    return z.object({});
  }

  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [name, param] of Object.entries(tool.parameters)) {
    if (secretParams.has(name)) {
      continue; // Skip secrets - they're injected
    }
    shape[name] = parameterToZod(param);
  }

  return z.object(shape);
}

/**
 * Convert Matimo tool to LangChain format
 */
async function convertTool(
  matimo: MatimoInstance,
  tool: ToolDefinition,
  secretParams: Set<string>,
  secrets: Record<string, string>
): Promise<LangChainTool> {
  const toolFn = await getLangChainTool();
  const schema = buildInputSchema(tool, secretParams);

  return toolFn(
    async (input: Record<string, unknown>) => {
      const params: Record<string, unknown> = { ...input };

      // Inject secrets
      for (const param of secretParams) {
        if (param in secrets) {
          params[param] = secrets[param];
        }
      }

      try {
        return await matimo.execute(tool.name, params);
      } catch (error) {
        return `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
    {
      name: tool.name,
      description: tool.description || tool.name,
      schema,
    }
  );
}

/**
 * Convert Matimo tools to LangChain format
 *
 * @param tools - Matimo tools
 * @param matimo - MatimoInstance
 * @param secrets - Map of parameter names to secret values
 * @param secretParamNames - Explicitly declared secret parameters (optional)
 * @returns LangChain tools
 *
 * @example
 * ```ts
 * const tools = await convertToolsToLangChain(
 *   matimo.listTools().filter(t => t.name.startsWith('slack')),
 *   matimo,
 *   { SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN }
 * );
 * ```
 */
export async function convertToolsToLangChain(
  tools: ToolDefinition[],
  matimo: MatimoInstance,
  secrets: Record<string, string> = {},
  secretParamNames?: Set<string>
): Promise<LangChainTool[]> {
  // Auto-detect secret params from the secrets map
  const detectedSecrets = secretParamNames || new Set(Object.keys(secrets));

  return Promise.all(tools.map((tool) => convertTool(matimo, tool, detectedSecrets, secrets)));
}
