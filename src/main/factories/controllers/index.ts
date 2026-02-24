import { DashboardController, InvoiceController } from "@/infrastructure/http/controllers";
import { makeDashboardService, makeInvoiceService } from "@/main/factories/services";

export function makeDashboardController(): DashboardController {
  return new DashboardController(makeDashboardService());
}

export function makeInvoiceController(): InvoiceController {
  return new InvoiceController(makeInvoiceService());
}
