import { InvoiceController } from "@/infrastructure/http/controllers";
import {
  InvoiceQueryParser,
  MultipartFileParser
} from "@/infrastructure/http/parsers";
import { makeInvoiceService } from "@/main/factories/services";

export function makeInvoiceController(): InvoiceController {
  return new InvoiceController(
    makeInvoiceService(),
    new InvoiceQueryParser(),
    new MultipartFileParser()
  );
}
