import { ProcessInvoiceDataUseCase } from "@/application/use-cases/invoices";
import { singleton } from "@/main/factories/singleton.util";

export const makeProcessInvoiceDataUseCase = singleton(
  () => new ProcessInvoiceDataUseCase()
);
