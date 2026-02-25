import { GetDashboardFinancialUseCase } from "@/application/use-cases/dashboard";
import { makeInvoiceRepository } from "@/main/factories/repositories";
import { singleton } from "@/main/factories/singleton.util";

export const makeGetDashboardFinancialUseCase = singleton(
  () => new GetDashboardFinancialUseCase(makeInvoiceRepository())
);
