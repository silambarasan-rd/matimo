import path from 'path';
import { ToolLoader } from './core/tool-loader';
import { ToolRegistry } from './core/tool-registry';
import { CommandExecutor } from './executors/command-executor';
import { HttpExecutor } from './executors/http-executor';
import { ToolDefinition } from './core/schema';
import { MatimoError, ErrorCode } from './errors/matimo-error';

/**
 * Matimo Instance - Single initialization point for tool execution
 * Combines loader, registry, and executors into one interface
 */
export class MatimoInstance {
  private toolsPath: string;
  private loader: ToolLoader;
  private registry: ToolRegistry;
  private commandExecutor: CommandExecutor;
  private httpExecutor: HttpExecutor;

  private constructor(toolsPath: string) {
    this.toolsPath = toolsPath;
    this.loader = new ToolLoader();
    this.registry = new ToolRegistry();
    // Use dirname to get parent directory reliably - works regardless of directory name
    const workingDir = path.dirname(toolsPath);
    this.commandExecutor = new CommandExecutor(workingDir);
    this.httpExecutor = new HttpExecutor();
  }

  /**
   * Initialize Matimo with tools from a directory
   * @param toolsPath - Path to tools directory
   * @returns MatimoInstance ready to execute tools
   */
  static async init(toolsPath: string): Promise<MatimoInstance> {
    const instance = new MatimoInstance(toolsPath);
    const tools = await instance.loader.loadToolsFromDirectory(toolsPath);
    instance.registry.registerAll(Array.from(tools.values()));
    return instance;
  }

  /**
   * Execute a tool by name with parameters
   * @param toolName - Name of the tool to execute
   * @param params - Tool parameters
   * @returns Tool execution result
   */
  async execute(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    const tool = this.registry.get(toolName);
    if (!tool) {
      throw new MatimoError(`Tool '${toolName}' not found in registry`, ErrorCode.TOOL_NOT_FOUND, {
        toolName,
        availableTools: this.registry.getAll().map((t) => t.name),
      });
    }

    const executor = this.getExecutor(tool);
    return executor.execute(tool, params);
  }

  /**
   * Get a tool definition by name
   * @param toolName - Name of the tool
   * @returns Tool definition or undefined
   */
  getTool(toolName: string): ToolDefinition | undefined {
    return this.registry.get(toolName);
  }

  /**
   * List all available tools
   * @returns Array of tool definitions
   */
  listTools(): ToolDefinition[] {
    return this.registry.getAll();
  }

  /**
   * Search tools by name or description
   * @param query - Search query
   * @returns Matching tools
   */
  searchTools(query: string): ToolDefinition[] {
    return this.registry.search(query);
  }

  /**
   * Get tools by tag
   * @param tag - Tag to search for
   * @returns Tools with the given tag
   */
  getToolsByTag(tag: string): ToolDefinition[] {
    return this.registry.getByTag(tag);
  }

  /**
   * Get the appropriate executor for a tool
   */
  private getExecutor(tool: ToolDefinition) {
    const executionType = tool.execution.type as string;
    switch (executionType) {
      case 'command':
        return this.commandExecutor;
      case 'http':
        return this.httpExecutor;
      default:
        throw new MatimoError(
          `Unsupported execution type: ${executionType}`,
          ErrorCode.EXECUTION_FAILED,
          { executionType }
        );
    }
  }
}

/**
 * Matimo namespace - Entry point for the SDK
 */
export const matimo = {
  /**
   * Initialize Matimo with a tools directory
   * @param toolsPath - Path to tools directory
   * @returns MatimoInstance ready to use
   */
  async init(toolsPath: string): Promise<MatimoInstance> {
    return MatimoInstance.init(toolsPath);
  },
};
