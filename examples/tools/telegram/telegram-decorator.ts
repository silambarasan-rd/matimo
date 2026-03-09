import { tool } from '@matimo/core';

class TelegramBot {
  @tool('telegram-send-message')
  async sendMessage(params: { chat_id: string; text: string; parse_mode?: string }) {
    // Implementation handled by Matimo decorator
    return params;
  }

  @tool('telegram-send-photo')
  async sendPhoto(params: { chat_id: string; photo: string; caption?: string }) {
    // Implementation handled by Matimo decorator
    return params;
  }

  @tool('telegram-get-chat')
  async getChat(params: { chat_id: string }) {
    // Implementation handled by Matimo decorator
    return params;
  }
}

async function main() {
  const bot = new TelegramBot();

  // Send message using decorated method
  await bot.sendMessage({
    chat_id: '@your_channel',
    text: '*Hello* from _Matimo_ Decorator Pattern!',
    parse_mode: 'Markdown',
  });

  // Send photo
  await bot.sendPhoto({
    chat_id: '@your_channel',
    photo: 'https://example.com/photo.jpg',
    caption: 'Photo via decorator pattern',
  });

  // Get chat info
  const chatInfo = await bot.getChat({
    chat_id: '@your_channel',
  });

  console.log('Chat retrieved:', chatInfo);
}

main().catch(console.error);
