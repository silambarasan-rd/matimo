import { MatimoInstance } from 'matimo';

async function main() {
  const matimo = await MatimoInstance.init({ autoDiscover: true });

  // Send a message
  const messageResult = await matimo.execute('telegram-send-message', {
    chat_id: '@your_channel',
    text: 'Hello from Matimo Factory Pattern!',
    parse_mode: 'Markdown',
  });

  console.log('Message sent:', messageResult.result.message_id);

  // Send a photo
  const photoResult = await matimo.execute('telegram-send-photo', {
    chat_id: '@your_channel',
    photo: 'https://example.com/image.jpg',
    caption: '*Beautiful image* from Matimo',
  });

  console.log('Photo sent:', photoResult.result.message_id);

  // Get chat info
  const chatInfo = await matimo.execute('telegram-get-chat', {
    chat_id: '@your_channel',
  });

  console.log('Chat info:', chatInfo.result);
}

main().catch(console.error);
