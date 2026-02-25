import Anthropic from "@anthropic-ai/sdk";
import { ClaudeLLMProvider } from "@/infrastructure/providers";
import { env } from "@/infrastructure/config/env.config";
import { singleton } from "@/main/factories/singleton.util";

export const makeClaudeLLMProvider = singleton(
  () =>
    new ClaudeLLMProvider(
      new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 0 })
    )
);
