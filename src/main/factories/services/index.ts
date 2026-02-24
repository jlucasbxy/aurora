import { InvoiceServiceImpl } from "@/infrastructure/services";
import {
  makeExtractInvoiceDataUseCase,
  makeProcessInvoiceDataUseCase,
  makeSaveInvoiceUseCase
} from "@/main/factories/use-cases";
import { singleton } from "@/main/factories/singleton.util";

export const makeInvoiceService = singleton(
  () =>
    new InvoiceServiceImpl(
      makeExtractInvoiceDataUseCase(),
      makeProcessInvoiceDataUseCase(),
      makeSaveInvoiceUseCase()
    )
);
