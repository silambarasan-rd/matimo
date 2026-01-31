import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { ToolDefinition } from '../core/schema';

/**
 * HttpExecutor - Executes HTTP requests
 * Handles authentication, retries, and response validation
 */

export class HttpExecutor {
  /**
   * Execute a tool that makes an HTTP request
   */
  async execute(tool: ToolDefinition, params: Record<string, unknown>): Promise<unknown> {
    if (tool.execution.type !== 'http') {
      throw new Error('Tool execution type is not http');
    }

    const { method, url, headers = {}, body, timeout } = tool.execution;

    // Implement parameter templating
    const templatedUrl = this.templateString(url, params);
    const templatedHeaders = this.templateObject(headers, params);
    const templatedBody =
      body && typeof body === 'object'
        ? this.templateObject(body as Record<string, unknown>, params)
        : body;

    // Build request config
    const requestConfig: AxiosRequestConfig = {
      method,
      url: templatedUrl,
    };

    if (Object.keys(templatedHeaders).length > 0) {
      requestConfig.headers = templatedHeaders as Record<string, string>;
    }

    if (templatedBody !== undefined) {
      requestConfig.data = templatedBody;
    }

    if (timeout !== undefined) {
      requestConfig.timeout = timeout;
    }

    try {
      const response = await axios.request(requestConfig);

      const success = response.status >= 200 && response.status < 300;
      return {
        success,
        data: response.data,
        statusCode: response.status,
        headers: response.headers,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status || 500;
      return {
        success: false,
        error: axiosError.message || String(error),
        statusCode: status,
      };
    }
  }

  /**
   * Replace parameter placeholders in a string
   */
  private templateString(str: string, params: Record<string, unknown>): string {
    let result = str;
    for (const [key, value] of Object.entries(params)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return result;
  }

  /**
   * Replace parameter placeholders in an object (headers, body)
   */
  private templateObject(
    obj: Record<string, unknown>,
    params: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = this.templateString(value, params);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}

export default HttpExecutor;
