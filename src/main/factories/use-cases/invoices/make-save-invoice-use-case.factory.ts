import { SaveInvoiceUseCase } from "@/application/use-cases/invoices";
import { makeInvoiceRepository } from "@/main/factories/repositories";
import { singleton } from "@/main/factories/singleton.util";

export const makeSaveInvoiceUseCase = singleton(
  () => new SaveInvoiceUseCase(makeInvoiceRepository())
);
