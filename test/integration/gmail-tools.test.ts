/**
 * Test suite for Gmail tools
 * Verifies tool definitions, schemas, and structure
 */

import { ToolLoader } from '../../src/core/tool-loader';
import { ToolRegistry } from '../../src/core/tool-registry';
import { Parameter, HttpExecution, OutputSchema, ErrorHandlingConfig } from '../../src/core/types';
import path from 'path';

describe('Gmail Tools', () => {
  let loader: ToolLoader;

  beforeEach(() => {
    loader = new ToolLoader();
  });

  describe('Tool Loading', () => {
    it('should load all 5 Gmail tools from nested structure', async () => {
      const toolsPath = path.resolve(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);

      // Filter for Gmail tools
      const gmailTools = Array.from(tools.values()).filter((t: unknown) => {
        const tool = t as { name?: string };
        return tool.name?.startsWith('gmail-');
      });

      expect(gmailTools).toHaveLength(5);
      expect(
        gmailTools
          .map((t: unknown) => {
            const tool = t as { name?: string };
            return tool.name;
          })
          .sort()
      ).toEqual([
        'gmail-create-draft',
        'gmail-delete-message',
        'gmail-get-message',
        'gmail-list-messages',
        'gmail-send-email',
      ]);
    });

    it('should load send-email tool with correct structure', async () => {
      const toolsPath = path.resolve(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const sendEmailTool = tools.get('gmail-send-email');

      expect(sendEmailTool).toBeDefined();
      expect(sendEmailTool?.name).toBe('gmail-send-email');
      expect(sendEmailTool?.version).toBe('1.0.0');
      expect(sendEmailTool?.description).toContain('Send an email');
      expect(sendEmailTool?.execution?.type).toBe('http');
      expect(sendEmailTool?.authentication?.type).toBe('oauth2');
    });

    it('should load list-messages tool with camelCase parameters', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const listTool = tools.get('gmail-list-messages');

      expect(listTool).toBeDefined();
      expect(listTool?.parameters).toBeDefined();

      // Verify camelCase parameters match Gmail API
      const params = Object.keys(listTool?.parameters || {}).sort();
      expect(params).toContain('maxResults');
      expect(params).toContain('pageToken');
      expect(params).toContain('includeSpamTrash');
      expect(params).toContain('labelIds');
    });

    it('should have oauth2 authentication type for all tools', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);

      const sendEmail = tools.get('gmail-send-email');
      expect(sendEmail?.authentication?.type).toBe('oauth2');

      const listMessages = tools.get('gmail-list-messages');
      expect(listMessages?.authentication?.type).toBe('oauth2');

      const createDraft = tools.get('gmail-create-draft');
      expect(createDraft?.authentication?.type).toBe('oauth2');

      const deleteMessage = tools.get('gmail-delete-message');
      expect(deleteMessage?.authentication?.type).toBe('oauth2');

      const getMessage = tools.get('gmail-get-message');
      expect(getMessage?.authentication?.type).toBe('oauth2');
    });
  });

  describe('Tool Registration', () => {
    it('should register all Gmail tools in registry', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const gmailTools = Array.from(tools.values()).filter((t: unknown) => {
        const tool = t as { name?: string };
        return tool.name?.startsWith('gmail-');
      });

      const registry = new ToolRegistry();
      registry.registerAll(gmailTools);

      expect(registry.get('gmail-send-email')).toBeDefined();
      expect(registry.get('gmail-list-messages')).toBeDefined();
      expect(registry.get('gmail-get-message')).toBeDefined();
      expect(registry.get('gmail-create-draft')).toBeDefined();
      expect(registry.get('gmail-delete-message')).toBeDefined();
    });

    it('should retrieve tools by exact name', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const gmailTools = Array.from(tools.values()).filter((t: unknown) => {
        const tool = t as { name?: string };
        return tool.name?.startsWith('gmail-');
      });

      const registry = new ToolRegistry();
      registry.registerAll(gmailTools);

      const tool = registry.get('gmail-list-messages');
      expect(tool?.name).toBe('gmail-list-messages');
      const execution = tool?.execution as { url?: string } | undefined;
      expect(execution?.url).toContain('messages');
    });
  });

  describe('Parameter Validation', () => {
    it('send-email should have required parameters: to, subject, body', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const sendEmail = tools.get('gmail-send-email');

      const requiredParams = Object.entries(sendEmail?.parameters || {})
        .filter(([_, param]: [string, Parameter]) => param.required)
        .map(([name]) => name);

      expect(requiredParams).toContain('to');
      expect(requiredParams).toContain('subject');
      expect(requiredParams).toContain('body');
    });

    it('list-messages should have query as optional parameter', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const listMessages = tools.get('gmail-list-messages');
      const queryParam = (listMessages?.parameters || {}).query as Parameter | undefined;

      expect(queryParam).toBeDefined();
      expect(queryParam?.required).toBe(false);
      expect(queryParam?.type).toBe('string');
    });

    it('get-message should have format enum with valid options', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const getMessage = tools.get('gmail-get-message');
      const formatParam = (getMessage?.parameters || {}).format as Parameter | undefined;

      expect(formatParam).toBeDefined();
      expect(formatParam?.enum).toContain('minimal');
      expect(formatParam?.enum).toContain('full');
      expect(formatParam?.enum).toContain('raw');
    });

    it('delete-message should have message_id as required parameter', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const deleteMessage = tools.get('gmail-delete-message');
      const messageIdParam = (deleteMessage?.parameters || {}).message_id as Parameter | undefined;

      expect(messageIdParam).toBeDefined();
      expect(messageIdParam?.required).toBe(true);
      expect(messageIdParam?.type).toBe('string');
    });
  });

  describe('HTTP Configuration', () => {
    it('should have correct HTTP methods for each tool', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);

      expect((tools.get('gmail-send-email')?.execution as HttpExecution)?.method).toBe('POST');
      expect((tools.get('gmail-list-messages')?.execution as HttpExecution)?.method).toBe('GET');
      expect((tools.get('gmail-get-message')?.execution as HttpExecution)?.method).toBe('GET');
      expect((tools.get('gmail-create-draft')?.execution as HttpExecution)?.method).toBe('POST');
      expect((tools.get('gmail-delete-message')?.execution as HttpExecution)?.method).toBe(
        'DELETE'
      );
    });

    it('should use correct Gmail API endpoints', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);

      const sendEmail = (tools.get('gmail-send-email')?.execution as HttpExecution)?.url;
      expect(sendEmail).toContain('gmail/v1/users/me/messages/send');

      const listMessages = (tools.get('gmail-list-messages')?.execution as HttpExecution)?.url;
      expect(listMessages).toContain('gmail/v1/users/me/messages');

      const getMessage = (tools.get('gmail-get-message')?.execution as HttpExecution)?.url;
      expect(getMessage).toContain('gmail/v1/users/me/messages');

      const createDraft = (tools.get('gmail-create-draft')?.execution as HttpExecution)?.url;
      expect(createDraft).toContain('gmail/v1/users/me/drafts');

      const deleteMessage = (tools.get('gmail-delete-message')?.execution as HttpExecution)?.url;
      expect(deleteMessage).toContain('gmail/v1/users/me/messages');
    });

    it('should include Authorization header with Bearer token', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);

      const headers = (tools.get('gmail-send-email')?.execution as HttpExecution)?.headers;
      expect(headers?.Authorization).toContain('Bearer');
    });
  });

  describe('Output Schema', () => {
    it('send-email should return id, threadId, labelIds', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const schema = tools.get('gmail-send-email')?.output_schema as OutputSchema | undefined;

      expect(schema?.properties).toBeDefined();
      expect(schema?.properties?.id).toBeDefined();
      expect(schema?.properties?.threadId).toBeDefined();
      expect(schema?.properties?.labelIds).toBeDefined();
    });

    it('list-messages should return messages array with pagination', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const schema = tools.get('gmail-list-messages')?.output_schema as OutputSchema | undefined;

      expect(schema?.properties?.messages).toBeDefined();
      expect(schema?.properties?.nextPageToken).toBeDefined();
      expect(schema?.properties?.resultSizeEstimate).toBeDefined();
    });

    it('get-message should include headers and body', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const schema = tools.get('gmail-get-message')?.output_schema as OutputSchema | undefined;

      expect(schema?.properties).toBeDefined();
      expect(schema?.properties?.headers).toBeDefined();
      expect(schema?.properties?.body).toBeDefined();
    });

    it('create-draft should return Draft object with id and message', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const schema = tools.get('gmail-create-draft')?.output_schema as OutputSchema | undefined;

      expect(schema?.properties).toBeDefined();
      expect(schema?.properties?.id).toBeDefined();
    });

    it('delete-message response should indicate success', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const schema = tools.get('gmail-delete-message')?.output_schema as OutputSchema | undefined;

      expect(schema?.properties).toBeDefined();
      expect(schema?.properties?.success).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('all Gmail tools should have retry configuration', async () => {
      const toolsPath = path.join(__dirname, '../../tools');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const gmailTools = Array.from(tools.values()).filter((t: unknown) => {
        const tool = t as { name?: string };
        return tool.name?.startsWith('gmail-');
      });

      gmailTools.forEach((tool: unknown) => {
        const gmailTool = tool as { error_handling?: ErrorHandlingConfig };
        const errorHandling = gmailTool.error_handling as ErrorHandlingConfig | undefined;
        expect(errorHandling?.retry).toBe(3);
        expect(errorHandling?.backoff_type).toBe('exponential');
        expect(errorHandling?.initial_delay_ms).toBeGreaterThan(0);
      });
    });
  });
});
