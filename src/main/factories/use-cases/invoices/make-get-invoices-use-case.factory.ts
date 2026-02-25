import { GetInvoicesUseCase } from "@/application/use-cases/invoices";
import { makeInvoiceRepository } from "@/main/factories/repositories";
import { singleton } from "@/main/factories/singleton.util";

export const makeGetInvoicesUseCase = singleton(
  () => new GetInvoicesUseCase(makeInvoiceRepository())
);
