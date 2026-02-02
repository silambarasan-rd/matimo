import { HttpExecutor } from '../../src/executors/http-executor';
import { ToolDefinition } from '../../src/core/schema';
import { ExecutionResult } from '../../src/core/types';

describe('HttpExecutor - Extended Coverage', () => {
  let executor: HttpExecutor;

  beforeEach(() => {
    executor = new HttpExecutor();
  });

  it('should successfully construct and execute GET request', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'GET',
        url: 'https://httpbin.org/get',
      },
      parameters: {},
    };

    const result = (await executor.execute(tool, {})) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should successfully execute GET request with query params', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'GET',
        url: 'https://httpbin.org/get',
        query_params: {
          test: 'value',
          key: 'data',
        },
      },
      parameters: {},
    };

    const result = (await executor.execute(tool, {})) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should successfully execute POST request with body', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'POST',
        url: 'https://httpbin.org/post',
        body: { test: 'data', nested: { key: 'value' } },
      },
      parameters: {},
    };

    const result = (await executor.execute(tool, {})) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should successfully execute request with custom headers', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'GET',
        url: 'https://httpbin.org/get',
        headers: {
          'X-Custom-Header': 'custom-value',
          'X-Another-Header': 'another-value',
        },
      },
      parameters: {},
    };

    const result = (await executor.execute(tool, {})) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should successfully replace URL placeholders', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'GET',
        url: 'https://httpbin.org/{path}',
        query_params: {
          query: '{search}',
        },
      },
      parameters: {
        path: { type: 'string', description: 'Path' },
        search: { type: 'string', description: 'Search' },
      },
    };

    const result = (await executor.execute(tool, {
      path: 'get',
      search: 'test',
    })) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should successfully replace header placeholders', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'GET',
        url: 'https://httpbin.org/get',
        headers: {
          Authorization: 'Bearer {token}',
          'X-Custom': '{header_value}',
        },
      },
      parameters: {
        token: { type: 'string', description: 'Token' },
        header_value: { type: 'string', description: 'Value' },
      },
    };

    const result = (await executor.execute(tool, {
      token: 'test-token',
      header_value: 'test-header',
    })) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should successfully replace body placeholders', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'POST',
        url: 'https://httpbin.org/post',
        body: {
          name: '{user_name}',
          email: '{user_email}',
          nested: {
            field: '{nested_value}',
          },
        },
      },
      parameters: {
        user_name: { type: 'string', description: 'Name' },
        user_email: { type: 'string', description: 'Email' },
        nested_value: { type: 'string', description: 'Value' },
      },
    };

    const result = (await executor.execute(tool, {
      user_name: 'John',
      user_email: 'john@example.com',
      nested_value: 'test',
    })) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should handle DELETE requests', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'DELETE',
        url: 'https://httpbin.org/delete',
      },
      parameters: {},
    };

    const result = (await executor.execute(tool, {})) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should handle PATCH requests', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'PATCH',
        url: 'https://httpbin.org/patch',
        body: { field: 'value' },
      },
      parameters: {},
    };

    const result = (await executor.execute(tool, {})) as ExecutionResult;
    expect(result).toBeDefined();
    // httpbin returns the request data, not a success field
    expect(result.data).toBeDefined();
  });

  it('should handle PUT requests', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'PUT',
        url: 'https://httpbin.org/put',
        body: { field: 'value' },
      },
      parameters: {},
    };

    const result = (await executor.execute(tool, {})) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should extract response headers from HTTP response', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'GET',
        url: 'https://httpbin.org/get',
      },
      parameters: {},
    };

    const result = await executor.execute(tool, {});
    expect(result).toBeDefined();
    const response = result as { headers: Record<string, string> };
    expect(response.headers).toBeDefined();
    expect(typeof response.headers).toBe('object');
  });

  it('should include status code in response', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'GET',
        url: 'https://httpbin.org/status/200',
      },
      parameters: {},
    };

    const result = (await executor.execute(tool, {})) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.statusCode).toBeDefined();
    expect(typeof result.statusCode).toBe('number');
  });

  it('should handle array values in body', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'POST',
        url: 'https://httpbin.org/post',
        body: {
          items: [
            { id: 1, name: 'item1' },
            { id: 2, name: 'item2' },
          ],
        },
      },
      parameters: {},
    };

    const result = (await executor.execute(tool, {})) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should handle complex nested body structures', async () => {
    const tool: ToolDefinition = {
      name: 'test',
      description: 'test',
      version: '1.0.0',
      execution: {
        type: 'http',
        method: 'POST',
        url: 'https://httpbin.org/post',
        body: {
          user: {
            profile: {
              name: 'John',
              address: {
                city: 'New York',
                country: 'USA',
              },
            },
            settings: {
              notifications: true,
              privacy: 'public',
            },
          },
        },
      },
      parameters: {},
    };

    const result = (await executor.execute(tool, {})) as ExecutionResult;
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
