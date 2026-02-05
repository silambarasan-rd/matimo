/**
 * Test suite for Slack tools
 * Verifies tool definitions, schemas, and structure
 */

import { ToolLoader } from '../../src/core/tool-loader';
import path from 'path';

describe('Slack Tools', () => {
  let loader: ToolLoader;

  beforeEach(() => {
    loader = new ToolLoader();
  });

  describe('Tool Loading', () => {
    it('should load all Slack tools from nested structure', async () => {
      const toolsPath = path.resolve(__dirname, '../../tools/slack');
      const tools = await loader.loadToolsFromDirectory(toolsPath);

      // We expect at least the initial set of tools we added
      expect(tools.size).toBeGreaterThanOrEqual(13);

      const toolNames = Array.from(tools.values()).map((t) => t.name);
      expect(toolNames).toContain('slack_send_channel_message');
      expect(toolNames).toContain('slack_get_user_info');
      expect(toolNames).toContain('slack-list-channels');
    });

    it('should load slack_send_channel_message with correct structure', async () => {
      const toolsPath = path.join(__dirname, '../../tools/slack');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const tool = tools.get('slack_send_channel_message');

      expect(tool).toBeDefined();
      expect(tool?.name).toBe('slack_send_channel_message');
      expect(tool?.execution?.type).toBe('http');
      expect(tool?.authentication?.type).toBe('api_key');

      const execution = tool?.execution as { method?: string; url?: string } | undefined;
      expect(execution?.method).toBe('POST');
      expect(execution?.url).toBe('https://slack.com/api/chat.postMessage');
    });

    it('should have correct parameters for slack_upload_file', async () => {
      const toolsPath = path.join(__dirname, '../../tools/slack');
      const tools = await loader.loadToolsFromDirectory(toolsPath);
      const tool = tools.get('slack_upload_file');

      expect(tool).toBeDefined();
      expect(tool?.parameters).toHaveProperty('filename');
      expect(tool?.parameters).toHaveProperty('file_size');
      expect(tool?.parameters).toHaveProperty('channel_id');
    });
  });

  describe('Authentication Configuration', () => {
    it('should use api_key for all Slack tools in current configuration', async () => {
      const toolsPath = path.resolve(__dirname, '../../tools/slack');
      const tools = await loader.loadToolsFromDirectory(toolsPath);

      for (const tool of tools.values()) {
        expect(tool.authentication?.type).toBe('api_key');
      }
    });

    it('should have the correct provider reference where applicable', async () => {
      const toolsPath = path.resolve(__dirname, '../../tools/slack');
      const tools = await loader.loadToolsFromDirectory(toolsPath);

      for (const tool of tools.values()) {
        // Most tools should reference the slack-provider
        // (Note: Some tools might not have provider field yet if it's default)
        if (tool.authentication?.provider) {
          expect(tool.authentication.provider).toBe('slack-provider');
        }
      }
    });
  });
});
