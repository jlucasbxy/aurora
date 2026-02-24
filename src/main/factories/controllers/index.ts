import { InvoiceController } from "@/infrastructure/http/controllers";
import { ExtractInvoiceDataUseCase } from "@/application/use-cases";
import { makeClaudeLLMProvider } from "@/main/factories/providers";

export function makeInvoiceController(): InvoiceController {
  return new InvoiceController(
    new ExtractInvoiceDataUseCase(makeClaudeLLMProvider())
  );
}
