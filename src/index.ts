/**
 * Matimo - Universal AI Agent Tools Ecosystem
 *
 * Framework-agnostic SDK that enables any developer to integrate 1000+ tools
 * across any AI framework (LangChain, CrewAI, Anthropic SDK, etc.).
 */

// Core types and schema
export type {
  Parameter,
  AuthConfig,
  HttpExecution,
  CommandExecution,
  OutputSchema,
  RateLimitConfig,
  ErrorHandlingConfig,
} from './core/types';
export { ParameterSchema, AuthConfigSchema, ExecutionConfigSchema } from './core/schema';
export { ToolLoader } from './core/tool-loader';
export { ToolRegistry } from './core/tool-registry';

// Executors
export { CommandExecutor } from './executors/command-executor';
export { HttpExecutor } from './executors/http-executor';

// Parameter Encoding
export { applyParameterEncodings } from './encodings/parameter-encoding';
export type { ParameterEncodingConfig } from './encodings/parameter-encoding';

// Decorators
export {
  tool,
  setGlobalMatimoInstance,
  getGlobalMatimoInstance,
} from './decorators/tool-decorator';

// Error handling
export {
  MatimoError,
  ErrorCode,
  createValidationError,
  createExecutionError,
} from './errors/matimo-error';

// Matimo instance and namespace
export { MatimoInstance, matimo } from './matimo-instance';

// OAuth2 authentication (Phase 2+)
export type {
  OAuth2Provider,
  OAuth2Token,
  OAuth2Config,
  AuthorizationOptions,
  TokenResponse,
  OAuth2Endpoints,
} from './auth/oauth2-config';
export type { ProviderDefinition } from './auth/oauth2-provider-loader';
export { OAuth2ProviderLoader } from './auth/oauth2-provider-loader';
export { OAuth2Handler } from './auth/oauth2-handler';
