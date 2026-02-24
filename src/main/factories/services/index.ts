import { DashboardServiceImpl, InvoiceServiceImpl } from "@/infrastructure/services";
import { singleton } from "@/main/factories/singleton.util";
import {
  makeExtractInvoiceDataUseCase,
  makeGetDashboardEnergyUseCase,
  makeGetDashboardFinancialUseCase,
  makeGetInvoicesUseCase,
  makeProcessInvoiceDataUseCase,
  makeSaveInvoiceUseCase
} from "@/main/factories/use-cases";

export const makeDashboardService = singleton(
  () =>
    new DashboardServiceImpl(
      makeGetDashboardEnergyUseCase(),
      makeGetDashboardFinancialUseCase()
    )
);

export const makeInvoiceService = singleton(
  () =>
    new InvoiceServiceImpl(
      makeExtractInvoiceDataUseCase(),
      makeGetInvoicesUseCase(),
      makeProcessInvoiceDataUseCase(),
      makeSaveInvoiceUseCase()
    )
);
