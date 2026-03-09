import { MatimoTool } from '@matimo/core';
import { Tool } from 'langchain/tools';

// Create LangChain-compatible tools
export class TelegramSendMessage extends Tool {
  name = 'telegram-send-message';
  description = 'Send a message to a Telegram chat';

  async _call(input: string): Promise<string> {
    const params = JSON.parse(input);
    const matimo = await MatimoInstance.init({ autoDiscover: true });

    const result = await matimo.execute('telegram-send-message', params);
    return JSON.stringify(result);
  }
}

export class TelegramSendPhoto extends Tool {
  name = 'telegram-send-photo';
  description = 'Send a photo to a Telegram chat';

  async _call(input: string): Promise<string> {
    const params = JSON.parse(input);
    const matimo = await MatimoInstance.init({ autoDiscover: true });

    const result = await matimo.execute('telegram-send-photo', params);
    return JSON.stringify(result);
  }
}

// Usage with LangChain
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { ChatOpenAI } from 'langchain/chat_models/openai';

async function main() {
  const tools = [new TelegramSendMessage(), new TelegramSendPhoto()];

  const executor = await initializeAgentExecutorWithOptions(tools, new ChatOpenAI(), {
    agentType: 'chat-conversational-react-description',
    verbose: true,
  });

  const result = await executor.call({
    input: 'Send a message saying "Hello from LangChain!" to @your_channel',
  });

  console.log(result.output);
}

main().catch(console.error);
