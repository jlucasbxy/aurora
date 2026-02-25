import { InvoiceServiceImpl } from "@/infrastructure/services";
import { singleton } from "@/main/factories/singleton.util";
import {
  makeExtractInvoiceDataUseCase,
  makeGetInvoicesUseCase,
  makeProcessInvoiceDataUseCase,
  makeSaveInvoiceUseCase
} from "@/main/factories/use-cases";

export const makeInvoiceService = singleton(
  () =>
    new InvoiceServiceImpl(
      makeExtractInvoiceDataUseCase(),
      makeGetInvoicesUseCase(),
      makeProcessInvoiceDataUseCase(),
      makeSaveInvoiceUseCase()
    )
);
