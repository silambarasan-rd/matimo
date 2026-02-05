import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { ToolDefinition } from '../core/schema';
import { applyParameterEncodings } from '../encodings/parameter-encoding';
import { MatimoError, ErrorCode } from '../errors/matimo-error';

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
      throw new MatimoError('Tool execution type is not http', ErrorCode.EXECUTION_FAILED, {
        expectedType: 'http',
        actualType: tool.execution.type,
      });
    }

    const {
      method,
      url,
      headers = {},
      body,
      timeout,
      query_params,
      parameter_encoding,
    } = tool.execution;
    const queryParams = query_params;
    const parameterEncodings = parameter_encoding;

    // Apply parameter encodings (e.g., MIME encoding for email parameters)
    let finalParams = params;
    if (parameterEncodings && parameterEncodings.length > 0) {
      finalParams = applyParameterEncodings(params, parameterEncodings);
    }

    // Implement parameter templating
    let finalUrl = this.templateString(url, finalParams);

    // Handle query parameters - only include non-empty ones
    if (queryParams) {
      const queryString = this.buildQueryString(queryParams, finalParams);
      if (queryString) {
        finalUrl += '?' + queryString;
      }
    }

    const templatedHeaders = this.templateObject(headers, finalParams);
    const templatedBody =
      body && typeof body === 'object'
        ? this.templateObject(body as Record<string, unknown>, finalParams)
        : body;

    // Build request config
    const requestConfig: AxiosRequestConfig = {
      method,
      url: finalUrl,
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
      const details = axiosError.response?.data || {};
      return {
        success: false,
        error: axiosError.message || String(error),
        statusCode: status,
        details,
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
      if (value !== undefined && value !== null && value !== '') {
        result = result.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }
    return result;
  }

  /**
   * Build query string from query_params, only including provided values
   */
  private buildQueryString(
    queryParams: Record<string, string>,
    params: Record<string, unknown>
  ): string {
    const parts: string[] = [];
    for (const [key, template] of Object.entries(queryParams)) {
      const value = this.templateString(template, params);
      // Only include if not empty and didn't result in "{param}" (unfilled placeholder)
      if (value && !value.startsWith('{')) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    return parts.join('&');
  }

  /**
   * Replace parameter placeholders in an object (headers, body)
   * Recursively handles nested objects
   */
  private templateObject(
    obj: Record<string, unknown>,
    params: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = this.templateString(value, params);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively template nested objects
        result[key] = this.templateObject(value as Record<string, unknown>, params);
      } else if (Array.isArray(value)) {
        // Handle arrays of objects
        result[key] = value.map((item) => {
          if (typeof item === 'string') {
            return this.templateString(item, params);
          } else if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
            return this.templateObject(item as Record<string, unknown>, params);
          }
          return item;
        });
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}

export default HttpExecutor;
