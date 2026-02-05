import { MatimoInstance } from '../../src/matimo-instance';
import axios from 'axios';
import path from 'path';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Slack Tools Integration', () => {
  let matimo: MatimoInstance;
  const toolsPath = path.join(__dirname, '../../tools');

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock environment variable
    process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';

    // Initialize MatimoInstance which will load all tools
    matimo = await MatimoInstance.init(toolsPath);
  });

  afterEach(() => {
    delete process.env.SLACK_BOT_TOKEN;
  });

  it('should format slack_send_channel_message request correctly with injected auth', async () => {
    mockedAxios.request.mockResolvedValue({
      status: 200,
      data: { ok: true, channel: 'C123', ts: '123.456' },
      headers: {},
    } as unknown);

    const params = {
      channel: 'C123',
      text: 'Hello Slack!',
    };

    const result = (await matimo.execute('slack_send_channel_message', params)) as Record<
      string,
      unknown
    >;

    expect(result.success).toBe(true);
    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://slack.com/api/chat.postMessage',
        headers: expect.objectContaining({
          Authorization: 'Bearer xoxb-test-token',
          'Content-Type': 'application/json',
        }),
        data: {
          channel: 'C123',
          text: 'Hello Slack!',
        },
      })
    );
  });

  it('should format slack_get_user_info request correctly with query params', async () => {
    mockedAxios.request.mockResolvedValue({
      status: 200,
      data: { ok: true, user: { id: 'U123', name: 'testuser' } },
      headers: {},
    } as unknown);

    const params = {
      user: 'U123',
    };

    await matimo.execute('slack_get_user_info', params);

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        // The HttpExecutor builds the query string into the URL
        url: 'https://slack.com/api/users.info?user=U123',
        headers: expect.objectContaining({
          Authorization: 'Bearer xoxb-test-token',
        }),
      })
    );
  });
});
