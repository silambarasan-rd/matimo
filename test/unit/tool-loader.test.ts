import { ToolLoader } from '../../src/core/tool-loader';
import * as path from 'path';
import * as fs from 'fs';

describe('ToolLoader', () => {
  const fixturesDir = path.join(__dirname, '../fixtures/tools');
  const loader = new ToolLoader();

  describe('loadToolFromFile', () => {
    it('should load a valid YAML tool definition', () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');

      const tool = loader.loadToolFromFile(toolPath);

      expect(tool).toBeDefined();
      expect(tool.name).toBe('calculator');
      expect(tool.version).toBe('1.0.0');
      expect(tool.parameters).toBeDefined();
    });

    it('should throw error for non-existent file', () => {
      const toolPath = path.join(fixturesDir, 'nonexistent.yaml');

      expect(() => loader.loadToolFromFile(toolPath)).toThrow();
    });

    it('should throw error for invalid YAML', () => {
      const tempFile = path.join(fixturesDir, 'invalid.yaml');
      fs.writeFileSync(tempFile, 'invalid: yaml: content: [');

      try {
        expect(() => loader.loadToolFromFile(tempFile)).toThrow();
      } finally {
        fs.unlinkSync(tempFile);
      }
    });

    it('should load JSON tool definition', () => {
      const tempFile = path.join(fixturesDir, 'test.json');
      const toolDef = {
        name: 'test-tool',
        version: '1.0.0',
        description: 'Test tool',
        parameters: {},
        execution: {
          type: 'command',
          command: 'echo',
          args: ['test'],
        },
      };
      fs.writeFileSync(tempFile, JSON.stringify(toolDef, null, 2));

      try {
        const tool = loader.loadToolFromFile(tempFile);
        expect(tool.name).toBe('test-tool');
      } finally {
        fs.unlinkSync(tempFile);
      }
    });
  });

  describe('loadToolFromObject', () => {
    it('should load a tool from JavaScript object', () => {
      const toolDef = {
        name: 'echo',
        version: '1.0.0',
        description: 'Echo tool',
        parameters: {
          message: {
            type: 'string' as const,
            description: 'Message to echo',
          },
        },
        execution: {
          type: 'command' as const,
          command: 'echo',
          args: ['{message}'],
        },
      };

      const tool = loader.loadToolFromObject(toolDef);
      expect(tool.name).toBe('echo');
      expect(tool.parameters).toBeDefined();
    });

    it('should validate tool definition on load', () => {
      const invalidTool = {
        name: 'incomplete',
      };

      expect(() => loader.loadToolFromObject(invalidTool as unknown)).toThrow();
    });
  });

  describe('loadToolsFromDirectory', () => {
    it('should load all tools from directory', () => {
      const tools = loader.loadToolsFromDirectory(fixturesDir);

      expect(tools instanceof Map).toBe(true);
      expect(tools.size).toBeGreaterThan(0);
    });

    it('should load tools recursively from subdirectories', () => {
      const tools = loader.loadToolsFromDirectory(fixturesDir);

      const toolNames = Array.from(tools.keys());
      expect(toolNames.length).toBeGreaterThan(0);
    });

    it('should skip non-YAML/JSON files', () => {
      const tempFile = path.join(fixturesDir, 'readme.txt');
      fs.writeFileSync(tempFile, 'This is not a tool');

      try {
        const tools = loader.loadToolsFromDirectory(fixturesDir);
        expect(tools instanceof Map).toBe(true);
      } finally {
        fs.unlinkSync(tempFile);
      }
    });

    it('should return empty map for empty directory', () => {
      const uniqueName = 'empty-dir-' + Date.now();
      const tempDir = path.join(fixturesDir, uniqueName);
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        const tools = loader.loadToolsFromDirectory(tempDir);
        expect(tools instanceof Map).toBe(true);
      } finally {
        try {
          fs.rmdirSync(tempDir);
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  });

  describe('Tool property validation', () => {
    it('should have name property', () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      expect(typeof tool.name).toBe('string');
      expect(tool.name.length).toBeGreaterThan(0);
    });

    it('should have version property', () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      expect(tool.version).toBeDefined();
      expect(typeof tool.version).toBe('string');
    });

    it('should have description property', () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      expect(tool.description).toBeDefined();
      expect(typeof tool.description).toBe('string');
    });

    it('should have parameters property', () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      expect(tool.parameters).toBeDefined();
      expect(typeof tool.parameters).toBe('object');
    });

    it('should have execution property', () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      expect(tool.execution).toBeDefined();
      expect(['command', 'http']).toContain(tool.execution.type);
    });

    it('should throw error for unsupported file format', () => {
      // Create a temporary unsupported file format
      const tempDir = path.join(process.cwd(), 'temp-test-' + Date.now());
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const unsupportedPath = path.join(tempDir, 'tool.txt');
      fs.writeFileSync(unsupportedPath, 'invalid');

      try {
        expect(() => {
          loader.loadToolFromFile(unsupportedPath);
        }).toThrow('Unsupported file format: .txt');
      } finally {
        if (fs.existsSync(unsupportedPath)) {
          fs.unlinkSync(unsupportedPath);
        }
        if (fs.existsSync(tempDir)) {
          fs.rmdirSync(tempDir);
        }
      }
    });

    it('should throw error for invalid tool definition', () => {
      // Create a temporary invalid YAML file
      const tempDir = path.join(process.cwd(), 'temp-test-' + Date.now());
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const invalidYamlPath = path.join(tempDir, 'invalid.yaml');
      // Write a YAML without required fields
      fs.writeFileSync(invalidYamlPath, 'name: test\nversion: 1.0.0\n');

      try {
        expect(() => {
          loader.loadToolFromFile(invalidYamlPath);
        }).toThrow('Invalid tool definition');
      } finally {
        if (fs.existsSync(invalidYamlPath)) {
          fs.unlinkSync(invalidYamlPath);
        }
        if (fs.existsSync(tempDir)) {
          fs.rmdirSync(tempDir);
        }
      }
    });

    it('should throw error when tools directory does not exist', () => {
      const nonExistentDir = '/nonexistent/tools/directory';
      expect(() => {
        loader.loadToolsFromDirectory(nonExistentDir);
      }).toThrow('Tools directory not found');
    });

    it('should handle invalid tool files gracefully', () => {
      // Create a directory with an invalid tool file
      const tempDir = path.join(process.cwd(), 'temp-invalid-tool-' + Date.now());
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const invalidYamlPath = path.join(tempDir, 'invalid-tool.yaml');
      // Write malformed YAML (missing required fields)
      fs.writeFileSync(invalidYamlPath, 'broken: yaml: structure:');

      try {
        // Should not throw, but log warning and skip invalid tool
        const tools = loader.loadToolsFromDirectory(tempDir);
        expect(tools instanceof Map).toBe(true);
        // Invalid tool should not be loaded
        expect(tools.size).toBe(0);
      } finally {
        if (fs.existsSync(invalidYamlPath)) {
          fs.unlinkSync(invalidYamlPath);
        }
        if (fs.existsSync(tempDir)) {
          fs.rmdirSync(tempDir);
        }
      }
    });
  });
});
