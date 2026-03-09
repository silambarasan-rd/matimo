# @matimo/telegram

Telegram tools for Matimo.

## Installation

```bash
npm install @matimo/telegram
# or
pnpm add @matimo/telegram
```

## 🛠️ Available Tools (7 Total)

| Tool | Method | Description |
|------|--------|-------------|
| **telegram-send-message** | POST | Send a text message |
| **telegram-send-photo** | POST | Send a photo |
| **telegram-send-document** | POST | Send a document |
| **telegram-get-chat** | GET | Get chat information |
| **telegram-set-webhook** | POST | Set webhook URL |

## 🚀 Quick Start

```typescript
import { MatimoInstance } from 'matimo';

const matimo = await MatimoInstance.init({ autoDiscover: true });

await matimo.execute('telegram-send-message', {
  chat_id: '@your_channel',
  text: 'Hello from Matimo!'
});
```

## 🔐 Authentication Setup

### Get Your Notion API Token
Create a bot via @BotFather and get your bot token.

Set the environment variable:
   ```bash
   export TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```
  
## 📖 Integration Examples

### Factory Pattern (Simple)

```typescript
const result = await matimo.execute('telegram-send-message', params);
```

### Decorator Pattern

```typescript
import { tool } from '@matimo/core';

class TelegramBot {
  @tool('telegram-send-message')
  async sendMessage(params: { chat_id: string; text: string }) {
    // Implementation handled by Matimo
  }
}
```

### LangChain Integration

```typescript
import { TelegramSendMessage } from '@matimo/telegram/langchain';

const tool = new TelegramSendMessage();
```