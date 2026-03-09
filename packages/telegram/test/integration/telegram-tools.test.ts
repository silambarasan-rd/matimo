import { describe, it, expect, beforeAll } from '@jest/globals';
import { MatimoInstance } from '@matimo/core';
import path from 'path';

describe('Telegram Tools Integration Tests', () => {
  let matimo: MatimoInstance;

  beforeAll(async () => {
    const toolsPath = path.join(__dirname, '../../tools');
    matimo = await MatimoInstance.init(toolsPath);
  });

  describe('telegram-send-message', () => {
    it('should send a text message', async () => {
      // Mock the API call for testing
      const result = (await matimo.execute('telegram-send-message', {
        chat_id: '@test_channel',
        text: 'Test message',
      })) as {
        ok?: boolean;
        result?: { message_id: number; chat: string; text: string };
      };

      expect(result.ok).toBe(true);
      expect(result.result).toHaveProperty('message_id');
    });

    it('should handle invalid chat_id', async () => {
      await expect(
        matimo.execute('telegram-send-message', {
          chat_id: 'invalid_chat',
          text: 'Test',
        })
      ).rejects.toThrow();
    });
  });

  describe('telegram-get-chat', () => {
    it('should get chat information', async () => {
      const result = (await matimo.execute('telegram-get-chat', {
        chat_id: '@test_channel',
      })) as {
        ok?: boolean;
        result?: { id: number; type: string; title: string; username: string };
      };

      expect(result.ok).toBe(true);
      expect(result.result).toHaveProperty('id');
      expect(result.result).toHaveProperty('type');
    });
  });

  describe('telegram-set-webhook', () => {
    it('should set webhook URL', async () => {
      const result = (await matimo.execute('telegram-set-webhook', {
        url: 'https://example.com/webhook',
      })) as {
        ok?: boolean;
        result?: boolean;
        description?: string;
      };

      expect(result.ok).toBe(true);
      expect(result.result).toBe(true);
    });
  });
});
