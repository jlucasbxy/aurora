import { DashboardController } from "@/infrastructure/http/controllers";
import { makeDashboardService } from "@/main/factories/services";

export function makeDashboardController(): DashboardController {
  return new DashboardController(makeDashboardService());
}
