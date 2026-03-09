import { describe, it, expect, beforeAll } from '@jest/globals';
import { MatimoInstance } from '../../../core/src/matimo-instance';
import path from 'path';
import axios from 'axios';

jest.mock('axios');

describe.only('Telegram Tools Integration Tests', () => {
  let matimo: MatimoInstance;

  beforeAll(async () => {
    const toolsPath = path.join(__dirname, '../../tools');
    matimo = await MatimoInstance.init(toolsPath);
  });

  describe('telegram-send-message', () => {
    it('should send a text message', async () => {
      (axios.request as jest.MockedFunction<typeof axios.request>).mockResolvedValue({
        data: {
          ok: true,
          result: {
            message_id: 5,
            sender_chat: {
              id: -1003805860848,
              title: 'test_channel',
              username: 'test_channel',
              type: 'channel',
            },
            chat: {
              id: -1003805860848,
              title: 'test_channel',
              username: 'test_channel',
              type: 'channel',
            },
            date: 1773029938,
            text: 'Testing',
          },
        },
        status: 200,
        headers: {},
      });

      // Mock the API call for testing
      const result = (await matimo.execute('telegram-send-message', {
        chat_id: '@test_channel',
        text: 'Test message',
        TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      })) as {
        success: boolean;
        data: {
          ok?: boolean;
          result?: { message_id: number; chat: string; text: string };
        };
        statusCode: number;
      };

      expect(result['data'].ok).toBe(true);
      expect(result['data'].result).toHaveProperty('message_id');
    });

    it('should handle invalid chat_id', async () => {
      (axios.request as jest.MockedFunction<typeof axios.request>).mockRejectedValueOnce(
        new Error('Invalid chat_id')
      );

      await expect(
        matimo.execute('telegram-send-message', {
          chat_id: 'invalid_chat',
          text: 'Test',
          TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        })
      ).rejects.toThrow();
    });
  });

  describe('telegram-get-chat', () => {
    it('should get chat information', async () => {
      (axios.request as jest.MockedFunction<typeof axios.request>).mockResolvedValue({
        data: {
          ok: true,
          result: {
            id: -1003805860848,
            title: 'test_channel',
            username: 'test_channel',
            type: 'channel',
            invite_link: 'https://t.me/+testInviteLink',
            can_send_gift: true,
            has_visible_history: true,
            can_send_paid_media: true,
            accepted_gift_types: {
              unlimited_gifts: true,
              limited_gifts: true,
              unique_gifts: true,
              premium_subscription: true,
              gifts_from_channels: true,
            },
            available_reactions: [],
            max_reaction_count: 11,
            accent_color_id: 6,
          },
        },
        status: 200,
        headers: {},
      });

      const result = (await matimo.execute('telegram-get-chat', {
        chat_id: '@test_channel',
        TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      })) as {
        success: boolean;
        data: {
          ok?: boolean;
          result?: { id: number; type: string; title: string; username: string };
        };
      };

      expect(result['data'].ok).toBe(true);
      expect(result['data'].result).toHaveProperty('id');
      expect(result['data'].result).toHaveProperty('type');
    });
  });

  describe('telegram-set-webhook', () => {
    it('should set webhook URL', async () => {
      (axios.request as jest.MockedFunction<typeof axios.request>).mockResolvedValue({
        data: {
          ok: true,
          result: true,
          description: 'Webhook was set',
        },
        status: 200,
        headers: {},
      });

      const result = (await matimo.execute('telegram-set-webhook', {
        url: 'https://example.com/webhook',
        TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      })) as {
        success: boolean;
        data: {
          ok?: boolean;
          result?: boolean;
          description?: string;
        };
      };

      expect(result['data'].ok).toBe(true);
      expect(result['data'].result).toBe(true);
    });
  });
});
