import { HttpExecutor } from '../../src/executors/http-executor';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpExecutor', () => {
  let executor: HttpExecutor;

  beforeEach(() => {
    executor = new HttpExecutor();
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should execute HTTP GET request', async () => {
      const tool = {
        name: 'http-get',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'http' as const,
          method: 'GET' as const,
          url: 'https://api.example.com/users',
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: { id: 1, name: 'Test User' },
      });

      const result = (await executor.execute(tool, {})) as Record<string, unknown>;
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.example.com/users',
        timeout: undefined,
      });
    });

    it('should execute HTTP POST request with body', async () => {
      const tool = {
        name: 'http-post',
        version: '1.0.0',
        description: 'Test',
        parameters: {
          name: {
            type: 'string' as const,
            description: 'Name',
          },
        },
        execution: {
          type: 'http' as const,
          method: 'POST' as const,
          url: 'https://api.example.com/users',
          body: { name: '{name}' },
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 201,
        data: { id: 2, name: 'New User' },
      });

      const result = (await executor.execute(tool, { name: 'New User' })) as Record<
        string,
        unknown
      >;
      expect(result.success).toBe(true);
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.example.com/users',
        data: { name: 'New User' },
        timeout: undefined,
      });
    });

    it('should include custom headers', async () => {
      const tool = {
        name: 'http-headers',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'http' as const,
          method: 'GET' as const,
          url: 'https://api.example.com/data',
          headers: {
            Authorization: 'Bearer token123',
            'X-Custom-Header': 'value',
          },
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: { result: 'success' },
      });

      const result = (await executor.execute(tool, {})) as Record<string, unknown>;
      expect(result.success).toBe(true);
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer token123',
            'X-Custom-Header': 'value',
          },
        })
      );
    });

    it('should support PUT requests', async () => {
      const tool = {
        name: 'http-put',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'http' as const,
          method: 'PUT' as const,
          url: 'https://api.example.com/users/1',
          body: { name: 'Updated Name' },
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: { id: 1, name: 'Updated Name' },
      });

      const result = (await executor.execute(tool, {})) as Record<string, unknown>;
      expect(result.success).toBe(true);
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('should support DELETE requests', async () => {
      const tool = {
        name: 'http-delete',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'http' as const,
          method: 'DELETE' as const,
          url: 'https://api.example.com/users/1',
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 204,
        data: null,
      });

      const result = (await executor.execute(tool, {})) as Record<string, unknown>;
      expect(result.success).toBe(true);
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should support PATCH requests', async () => {
      const tool = {
        name: 'http-patch',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'http' as const,
          method: 'PATCH' as const,
          url: 'https://api.example.com/users/1',
          body: { status: 'active' },
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: { id: 1, status: 'active' },
      });

      const result = (await executor.execute(tool, {})) as Record<string, unknown>;
      expect(result.success).toBe(true);
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });

    it('should handle request timeout', async () => {
      const tool = {
        name: 'http-timeout',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'http' as const,
          method: 'GET' as const,
          url: 'https://api.example.com/data',
          timeout: 5000,
        },
      };

      mockedAxios.request.mockRejectedValue(new Error('timeout'));

      const result = (await executor.execute(tool, {})) as Record<string, unknown>;
      expect(result.success).toBe(false);
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
        })
      );
    });

    it('should handle HTTP errors', async () => {
      const tool = {
        name: 'http-error',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'http' as const,
          method: 'GET' as const,
          url: 'https://api.example.com/notfound',
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 404,
        data: { error: 'Not found' },
      });

      const result = (await executor.execute(tool, {})) as Record<string, unknown>;
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
    });

    it('should handle connection errors', async () => {
      const tool = {
        name: 'http-connection-error',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'http' as const,
          method: 'GET' as const,
          url: 'https://invalid-domain-12345.com',
        },
      };

      mockedAxios.request.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = (await executor.execute(tool, {})) as Record<string, unknown>;
      expect(result.success).toBe(false);
      expect(result.error).toContain('ECONNREFUSED');
    });
  });

  describe('parameter templating', () => {
    it('should template URL parameters', async () => {
      const tool = {
        name: 'url-template',
        version: '1.0.0',
        description: 'Test',
        parameters: {
          userId: {
            type: 'string' as const,
            description: 'User ID',
          },
        },
        execution: {
          type: 'http' as const,
          method: 'GET' as const,
          url: 'https://api.example.com/users/{userId}',
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: {},
      });

      await executor.execute(tool, { userId: '123' });

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/users/123',
        })
      );
    });

    it('should template body parameters', async () => {
      const tool = {
        name: 'body-template',
        version: '1.0.0',
        description: 'Test',
        parameters: {
          name: {
            type: 'string' as const,
            description: 'Name',
          },
          email: {
            type: 'string' as const,
            description: 'Email',
          },
        },
        execution: {
          type: 'http' as const,
          method: 'POST' as const,
          url: 'https://api.example.com/users',
          body: {
            name: '{name}',
            email: '{email}',
          },
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 201,
        data: {},
      });

      await executor.execute(tool, { name: 'John', email: 'john@example.com' });

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            name: 'John',
            email: 'john@example.com',
          },
        })
      );
    });

    it('should template header parameters', async () => {
      const tool = {
        name: 'header-template',
        version: '1.0.0',
        description: 'Test',
        parameters: {
          token: {
            type: 'string' as const,
            description: 'Token',
          },
        },
        execution: {
          type: 'http' as const,
          method: 'GET' as const,
          url: 'https://api.example.com/data',
          headers: {
            Authorization: 'Bearer {token}',
          },
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: {},
      });

      await executor.execute(tool, { token: 'secret123' });

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer secret123',
          },
        })
      );
    });
  });

  describe('result structure', () => {
    it('should return properly structured result', async () => {
      const tool = {
        name: 'http-result',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'http' as const,
          method: 'GET' as const,
          url: 'https://api.example.com/test',
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: { result: 'success' },
      });

      const result = (await executor.execute(tool, {})) as Record<string, unknown>;

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('data');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.statusCode).toBe('number');
    });

    it('should include response headers', async () => {
      const tool = {
        name: 'http-headers-response',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'http' as const,
          method: 'GET' as const,
          url: 'https://api.example.com/test',
        },
      };

      mockedAxios.request.mockResolvedValue({
        status: 200,
        headers: { 'content-type': 'application/json' },
        data: {},
      });

      const result = (await executor.execute(tool, {})) as Record<string, unknown>;

      expect(result).toHaveProperty('headers');
    });
  });
});
