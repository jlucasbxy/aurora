export interface Parser<T, K = unknown> {
  parse(input: K): T;
}
export { MultipartFileParser } from "@/infrastructure/http/parsers/multipart-file.parser";
export { InvoiceQueryParser } from "@/infrastructure/http/parsers/invoice-query.parser";
