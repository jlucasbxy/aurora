import {
  ExtractInvoiceDataUseCase,
  ProcessInvoiceDataUseCase,
  SaveInvoiceUseCase
} from "@/application/use-cases";
import { makeClaudeLLMProvider } from "@/main/factories/providers";
import { makeInvoiceRepository } from "@/main/factories/repositories";
import { singleton } from "@/main/factories/singleton.util";

export const makeExtractInvoiceDataUseCase = singleton(
  () => new ExtractInvoiceDataUseCase(makeClaudeLLMProvider())
);

export const makeProcessInvoiceDataUseCase = singleton(
  () => new ProcessInvoiceDataUseCase()
);

export const makeSaveInvoiceUseCase = singleton(
  () => new SaveInvoiceUseCase(makeInvoiceRepository())
);
