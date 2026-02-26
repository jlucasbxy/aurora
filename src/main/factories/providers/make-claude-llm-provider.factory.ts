import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/infrastructure/config/env.config";
import { ClaudeLLMProvider } from "@/infrastructure/providers";
import { singleton } from "@/main/factories/singleton.util";

export const makeClaudeLLMProvider = singleton(
  () =>
    new ClaudeLLMProvider(
      new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 0 })
    )
);
