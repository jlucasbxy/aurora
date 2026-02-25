import { InvoiceController } from "@/infrastructure/http/controllers";
import { makeInvoiceService } from "@/main/factories/services";

export function makeInvoiceController(): InvoiceController {
  return new InvoiceController(makeInvoiceService());
}
