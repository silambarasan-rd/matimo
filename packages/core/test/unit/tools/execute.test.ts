import path from 'path';
import fs from 'fs';
import { ToolLoader } from '../../../src/core/tool-loader';
import type { Parameter } from '../../../src/core/types';

describe('Execute Tool', () => {
  const coreToolsPath = path.join(__dirname, '../../../tools');
  let toolLoader: ToolLoader;

  beforeAll(() => {
    toolLoader = new ToolLoader();
  });

  describe('Tool Definition', () => {
    it('should have valid execute tool definition file', () => {
      const executePath = path.join(coreToolsPath, 'execute', 'definition.yaml');
      expect(fs.existsSync(executePath)).toBe(true);
    });

    it('should load execute tool with correct metadata', async () => {
      const tools = await toolLoader.loadToolsFromDirectory(coreToolsPath);
      const executeTool = tools.get('execute');

      expect(executeTool).toBeDefined();
      expect(executeTool!.name).toBe('execute');
      expect(executeTool!.version).toBe('1.0.0');
      expect(executeTool!.description).toBeDefined();
    });

    it('should have function-type execution', async () => {
      const tools = await toolLoader.loadToolsFromDirectory(coreToolsPath);
      const executeTool = tools.get('execute');

      expect(executeTool!.execution.type).toBe('function');
      expect(executeTool!.execution).toHaveProperty('code');
    });
  });

  describe('Parameters', () => {
    it('should have all required execute parameters', async () => {
      const tools = await toolLoader.loadToolsFromDirectory(coreToolsPath);
      const executeTool = tools.get('execute')!;

      expect(executeTool!.parameters).toBeDefined();
      const params = executeTool!.parameters as Record<string, Parameter>;
      expect(params.command).toBeDefined();
      expect(params.cwd).toBeDefined();
      expect(params.timeout).toBeDefined();
    });
  });

  describe('Output Schema', () => {
    it('should define output schema', async () => {
      const tools = await toolLoader.loadToolsFromDirectory(coreToolsPath);
      const executeTool = tools.get('execute')!;

      expect(executeTool!.output_schema).toBeDefined();
      expect(executeTool!.output_schema!.properties).toBeDefined();
    });

    it('should have success, stdout, stderr and exitCode fields', async () => {
      const tools = await toolLoader.loadToolsFromDirectory(coreToolsPath);
      const executeTool = tools.get('execute')!;

      const props = executeTool!.output_schema!.properties as Record<string, unknown>;
      expect(props).toHaveProperty('success');
      expect(props).toHaveProperty('stdout');
      expect(props).toHaveProperty('stderr');
      expect(props).toHaveProperty('exitCode');
    });
  });

  describe('Implementation', () => {
    it('should have implementation file', () => {
      const executeImplPath = path.join(coreToolsPath, 'execute', 'execute.ts');
      expect(fs.existsSync(executeImplPath)).toBe(true);
    });

    it('implementation should use exec from child_process', () => {
      const executeImplPath = path.join(coreToolsPath, 'execute', 'execute.ts');
      const content = fs.readFileSync(executeImplPath, 'utf-8');

      expect(content).toContain('child_process');
      expect(content).toContain('exec');
    });

    it('implementation should export default async function', () => {
      const executeImplPath = path.join(coreToolsPath, 'execute', 'execute.ts');
      const content = fs.readFileSync(executeImplPath, 'utf-8');

      expect(content).toContain('export default');
      expect(content).toContain('async');
    });
  });

  describe('Examples', () => {
    it('should include example in tool definition', async () => {
      const tools = await toolLoader.loadToolsFromDirectory(coreToolsPath);
      const executeTool = tools.get('execute')!;

      expect(executeTool!.examples).toBeDefined();
      expect(Array.isArray(executeTool!.examples)).toBe(true);
      expect((executeTool!.examples as Array<unknown>).length).toBeGreaterThan(0);
    });

    it('example should have name and params', async () => {
      const tools = await toolLoader.loadToolsFromDirectory(coreToolsPath);
      const executeTool = tools.get('execute')!;

      const example = (executeTool!.examples as Array<Record<string, unknown>>)[0] as Record<
        string,
        unknown
      >;
      expect(example.name).toBeDefined();
      expect(example.params).toBeDefined();
      expect((example.params as Record<string, unknown>).command).toBeDefined();
    });
  });
});
