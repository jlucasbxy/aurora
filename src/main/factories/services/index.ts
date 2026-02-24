import { InvoiceServiceImpl } from "@/infrastructure/services";
import { singleton } from "@/main/factories/singleton.util";
import {
  makeExtractInvoiceDataUseCase,
  makeProcessInvoiceDataUseCase,
  makeSaveInvoiceUseCase
} from "@/main/factories/use-cases";

export const makeInvoiceService = singleton(
  () =>
    new InvoiceServiceImpl(
      makeExtractInvoiceDataUseCase(),
      makeProcessInvoiceDataUseCase(),
      makeSaveInvoiceUseCase()
    )
);
