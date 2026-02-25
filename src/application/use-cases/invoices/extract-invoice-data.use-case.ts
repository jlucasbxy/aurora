import type { InvoiceExtractionDto } from "@/application/dtos";
import { LlmError } from "@/application/interfaces/providers";
import type { LLMProvider } from "@/application/interfaces/providers";
import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors";

export class ExtractInvoiceDataUseCase {
  constructor(private readonly llmProvider: LLMProvider) {}

  async execute(pdfBuffer: Buffer): Promise<InvoiceExtractionDto> {
    try {
      return await this.llmProvider.extractInvoiceData(pdfBuffer);
    } catch (error) {
      if (error instanceof LlmError) {
        const code =
          error.code === "RATE_LIMITED"
            ? ErrorCode.RATE_LIMIT_EXCEEDED
            : ErrorCode.INTERNAL_SERVER_ERROR;
        throw new DomainError(code, error.message);
      }
      throw error;
    }
  }
}
