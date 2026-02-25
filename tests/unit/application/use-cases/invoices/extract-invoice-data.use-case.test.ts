import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExtractInvoiceDataUseCase } from "@/application/use-cases/invoices/extract-invoice-data.use-case";
import type { LLMProvider } from "@/application/interfaces/providers";
import { LlmError } from "@/application/interfaces/providers";
import { DomainError } from "@/domain/errors";
import { ErrorCode } from "@/domain/enums";
import type { InvoiceExtractionDto } from "@/application/dtos";

const mockExtractionDto: InvoiceExtractionDto = {
  clientNumber: "7202788900",
  referenceMonth: "JAN/2024",
  electricEnergyQty: 100,
  electricEnergyValue: 50.0,
  sceeEnergyQty: 200,
  sceeEnergyValue: 25.0,
  compensatedEnergyQty: 150,
  compensatedEnergyValue: -20.0,
  publicLightingContrib: 10.0
};

describe("ExtractInvoiceDataUseCase", () => {
  const mockLlmProvider: LLMProvider = {
    sendStructuredRequest: vi.fn()
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns InvoiceExtractionDto when LLM resolves successfully", async () => {
    vi.mocked(mockLlmProvider.sendStructuredRequest).mockResolvedValue(mockExtractionDto);

    const useCase = new ExtractInvoiceDataUseCase(mockLlmProvider);
    const result = await useCase.execute(Buffer.from("pdf-content"));

    expect(result).toEqual(mockExtractionDto);
  });

  it("throws DomainError with RATE_LIMIT_EXCEEDED when LLM returns RATE_LIMITED", async () => {
    vi.mocked(mockLlmProvider.sendStructuredRequest).mockRejectedValue(
      new LlmError("RATE_LIMITED", "Rate limit exceeded")
    );

    const useCase = new ExtractInvoiceDataUseCase(mockLlmProvider);

    await expect(useCase.execute(Buffer.from("pdf-content"))).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof DomainError && err.code === ErrorCode.RATE_LIMIT_EXCEEDED
    );
  });

  it("throws DomainError with INTERNAL_SERVER_ERROR when LLM returns EXTRACTION_FAILED", async () => {
    vi.mocked(mockLlmProvider.sendStructuredRequest).mockRejectedValue(
      new LlmError("EXTRACTION_FAILED", "Could not extract data")
    );

    const useCase = new ExtractInvoiceDataUseCase(mockLlmProvider);

    await expect(useCase.execute(Buffer.from("pdf-content"))).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof DomainError && err.code === ErrorCode.INTERNAL_SERVER_ERROR
    );
  });

  it("re-throws non-LlmError errors unchanged", async () => {
    const unexpectedError = new Error("Unexpected network failure");
    vi.mocked(mockLlmProvider.sendStructuredRequest).mockRejectedValue(unexpectedError);

    const useCase = new ExtractInvoiceDataUseCase(mockLlmProvider);

    await expect(useCase.execute(Buffer.from("pdf-content"))).rejects.toBe(unexpectedError);
  });
});
