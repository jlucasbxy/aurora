import { DashboardController } from "@/infrastructure/http/controllers";
import { DashboardQueryParser } from "@/infrastructure/http/parsers";
import { makeDashboardService } from "@/main/factories/services";

export function makeDashboardController(): DashboardController {
  return new DashboardController(
    makeDashboardService(),
    new DashboardQueryParser()
  );
}
