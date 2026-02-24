import {
  ExtractInvoiceDataUseCase,
  GetDashboardEnergyUseCase,
  GetDashboardFinancialUseCase,
  GetInvoicesUseCase,
  ProcessInvoiceDataUseCase,
  SaveInvoiceUseCase
} from "@/application/use-cases";
import { makeClaudeLLMProvider } from "@/main/factories/providers";
import { makeInvoiceRepository } from "@/main/factories/repositories";
import { singleton } from "@/main/factories/singleton.util";

export const makeExtractInvoiceDataUseCase = singleton(
  () => new ExtractInvoiceDataUseCase(makeClaudeLLMProvider())
);

export const makeGetInvoicesUseCase = singleton(
  () => new GetInvoicesUseCase(makeInvoiceRepository())
);

export const makeProcessInvoiceDataUseCase = singleton(
  () => new ProcessInvoiceDataUseCase()
);

export const makeSaveInvoiceUseCase = singleton(
  () => new SaveInvoiceUseCase(makeInvoiceRepository())
);

export const makeGetDashboardEnergyUseCase = singleton(
  () => new GetDashboardEnergyUseCase(makeInvoiceRepository())
);

export const makeGetDashboardFinancialUseCase = singleton(
  () => new GetDashboardFinancialUseCase(makeInvoiceRepository())
);
