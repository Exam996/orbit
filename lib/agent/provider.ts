// AI Provider Abstraction
// This allows swapping AI providers (Gemini, OpenAI, Anthropic, etc.) without changing application code.

export interface AIProvider {
  name: string;
  generateResponse(prompt: string, context?: string): Promise<AIResponse>;
}

export interface AIResponse {
  content: string;
  toolCalls?: AIToolCall[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface AIToolCall {
  toolName: string;
  parameters: Record<string, unknown>;
}

// Configuration: which provider to use (set via environment variable)
export const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
export const AI_API_KEY = process.env.AI_API_KEY || '';

// Provider factory — extend this to add more providers
export function getAIProvider(): AIProvider | null {
  if (!AI_API_KEY) return null;

  switch (AI_PROVIDER) {
    case 'gemini':
      return new GeminiProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    default:
      return new GeminiProvider();
  }
}

// Stub providers — these would make actual API calls through server-side code.
// API keys are NEVER exposed to the browser.
class GeminiProvider implements AIProvider {
  name = 'gemini';
  async generateResponse(_prompt: string, _context?: string): Promise<AIResponse> {
    return { content: 'AI provider not yet configured. Set AI_API_KEY in your environment.' };
  }
}

class OpenAIProvider implements AIProvider {
  name = 'openai';
  async generateResponse(_prompt: string, _context?: string): Promise<AIResponse> {
    return { content: 'AI provider not yet configured. Set AI_API_KEY in your environment.' };
  }
}

class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  async generateResponse(_prompt: string, _context?: string): Promise<AIResponse> {
    return { content: 'AI provider not yet configured. Set AI_API_KEY in your environment.' };
  }
}
