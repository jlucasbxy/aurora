import { ExtractInvoiceDataUseCase } from "@/application/use-cases/invoices";
import { makeClaudeLLMProvider } from "@/main/factories/providers";
import { singleton } from "@/main/factories/singleton.util";

export const makeExtractInvoiceDataUseCase = singleton(
  () => new ExtractInvoiceDataUseCase(makeClaudeLLMProvider())
);
