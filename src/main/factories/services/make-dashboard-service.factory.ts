import { DashboardServiceImpl } from "@/infrastructure/services";
import { singleton } from "@/main/factories/singleton.util";
import {
  makeGetDashboardEnergyUseCase,
  makeGetDashboardFinancialUseCase
} from "@/main/factories/use-cases/dashboard";

export const makeDashboardService = singleton(
  () =>
    new DashboardServiceImpl(
      makeGetDashboardEnergyUseCase(),
      makeGetDashboardFinancialUseCase()
    )
);
