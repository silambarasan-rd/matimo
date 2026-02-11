/**
 * Core type definitions for Matimo tool ecosystem
 */

import { ParameterEncodingConfig } from '../encodings/parameter-encoding';

/**
 * Parameter definition for a tool
 */
export interface Parameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  enum?: (string | number | boolean)[];
  default?: unknown;
  items?: Parameter;
  properties?: Record<string, Parameter>;
}

/**
 * Authentication configuration for a tool
 */
export interface AuthConfig {
  type: 'none' | 'api_key' | 'oauth2' | 'basic' | 'bearer';
  location?: 'header' | 'query' | 'body';
  name?: string;
  scheme?: string;
}

/**
 * HTTP execution configuration
 */
export interface HttpExecution {
  type: 'http';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  params?: Record<string, string>;
  query_params?: Record<string, string>;
  parameter_encoding?: ParameterEncodingConfig[];
  timeout?: number;
}

/**
 * Command execution configuration
 */
export interface CommandExecution {
  type: 'command';
  command: string;
  args?: string[];
  cwd?: string;
  shell?: boolean;
  timeout?: number;
  env?: Record<string, string>;
}

/**
 * Function execution configuration
 * Supports embedded async functions for direct execution
 */
export interface FunctionExecution {
  type: 'function';
  code: string; // JavaScript async function code
  timeout?: number;
}

/**
 * Output schema for tool response validation
 */
export interface OutputSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, OutputSchema>;
  items?: OutputSchema;
  description?: string;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  enabled?: boolean;
  requests_per_minute?: number;
  requests_per_hour?: number;
  burst_size?: number;
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  retry?: number;
  backoff_type?: 'exponential' | 'linear' | 'fixed';
  initial_delay_ms?: number;
  max_delay_ms?: number;
}

/**
 * Tool example configuration
 */
export interface ToolExample {
  name: string;
  params: Record<string, unknown>;
  description?: string;
}

/**
 * Complete tool definition
 */
export interface ToolDefinition {
  name: string;
  version: string;
  description: string;
  parameters: Record<string, Parameter>;
  execution: HttpExecution | CommandExecution | FunctionExecution;
  authentication?: AuthConfig;
  output_schema?: OutputSchema;
  rate_limiting?: RateLimitConfig;
  error_handling?: ErrorHandlingConfig;
  examples?: ToolExample[];
  deprecated?: boolean;
  deprecation_message?: string;
  tags?: string[];
  /**
   * Internal: Path to the tool definition file (set by ToolLoader)
   * Used to resolve relative paths for function executors
   */
  _definitionPath?: string;
}

/**
 * Tool execution result
 */
export interface ExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  statusCode?: number;
  duration: number;
  traceId: string;
}

/**
 * Execution context for a tool run
 */
export interface ExecutionContext {
  traceId: string;
  userId?: string;
  toolName: string;
  parameters: Record<string, unknown>;
  timestamp: Date;
  secrets: Record<string, string>;
}

/**
 * Schema validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  expectedType?: string;
  receivedValue?: unknown;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
