import { ClaudeLLMProvider } from "@/infrastructure/providers";
import { singleton } from "@/main/factories/singleton.util";

export const makeClaudeLLMProvider = singleton(() => new ClaudeLLMProvider());
