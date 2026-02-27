import Anthropic from "@anthropic-ai/sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LlmError } from "@/application/interfaces/providers";
import { ClaudeLLMProvider } from "@/infrastructure/providers/claude-llm.provider";
import { z } from "zod";

const schema = z.object({ value: z.string() });

function createMockClient(parseFn: (...args: unknown[]) => unknown) {
  return {
    messages: { parse: parseFn }
  } as unknown as Anthropic;
}

describe("ClaudeLLMProvider", () => {
  const document = Buffer.from("pdf-content");
  const prompt = "Extract data";

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns parsed output on success", async () => {
    const mockParse = vi.fn().mockResolvedValue({
      parsed_output: { value: "test" }
    });
    const provider = new ClaudeLLMProvider(createMockClient(mockParse));

    const result = await provider.sendStructuredRequest(document, prompt, schema);

    expect(result).toEqual({ value: "test" });
    expect(mockParse).toHaveBeenCalledOnce();
  });

  it("throws LlmError RATE_LIMITED on RateLimitError", async () => {
    const rateLimitError = Object.create(Anthropic.RateLimitError.prototype);
    rateLimitError.status = 429;
    rateLimitError.message = "Rate limited";
    const mockParse = vi.fn().mockRejectedValue(rateLimitError);
    const provider = new ClaudeLLMProvider(createMockClient(mockParse));

    await expect(
      provider.sendStructuredRequest(document, prompt, schema)
    ).rejects.toSatisfy(
      (err: unknown) => err instanceof LlmError && err.code === "RATE_LIMITED"
    );
    expect(mockParse).toHaveBeenCalledOnce();
  });

  it("retries on APIConnectionError and throws EXTRACTION_FAILED after max attempts", async () => {
    const connectionError = new Anthropic.APIConnectionError({
      cause: new Error("Connection failed")
    });
    const mockParse = vi.fn().mockRejectedValue(connectionError);
    const provider = new ClaudeLLMProvider(createMockClient(mockParse));

    await expect(
      provider.sendStructuredRequest(document, prompt, schema)
    ).rejects.toSatisfy(
      (err: unknown) => err instanceof LlmError && err.code === "EXTRACTION_FAILED"
    );
    expect(mockParse).toHaveBeenCalledTimes(2);
  });

  it("retries on APIConnectionError then succeeds", async () => {
    const connectionError = new Anthropic.APIConnectionError({
      cause: new Error("Connection failed")
    });
    const mockParse = vi
      .fn()
      .mockRejectedValueOnce(connectionError)
      .mockResolvedValueOnce({ parsed_output: { value: "recovered" } });
    const provider = new ClaudeLLMProvider(createMockClient(mockParse));

    const result = await provider.sendStructuredRequest(document, prompt, schema);

    expect(result).toEqual({ value: "recovered" });
    expect(mockParse).toHaveBeenCalledTimes(2);
  });

  it("throws EXTRACTION_FAILED immediately on non-retryable error", async () => {
    const genericError = new Error("Something unexpected");
    const mockParse = vi.fn().mockRejectedValue(genericError);
    const provider = new ClaudeLLMProvider(createMockClient(mockParse));

    await expect(
      provider.sendStructuredRequest(document, prompt, schema)
    ).rejects.toSatisfy(
      (err: unknown) => err instanceof LlmError && err.code === "EXTRACTION_FAILED"
    );
    expect(mockParse).toHaveBeenCalledOnce();
  });

  it("retries when parsed_output is null and throws EXTRACTION_FAILED", async () => {
    const mockParse = vi.fn().mockResolvedValue({ parsed_output: null });
    const provider = new ClaudeLLMProvider(createMockClient(mockParse));

    await expect(
      provider.sendStructuredRequest(document, prompt, schema)
    ).rejects.toSatisfy(
      (err: unknown) => err instanceof LlmError && err.code === "EXTRACTION_FAILED"
    );
    expect(mockParse).toHaveBeenCalledTimes(2);
  });
});
