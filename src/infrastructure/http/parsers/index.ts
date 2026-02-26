export interface Parser<T, K = unknown> {
  parse(...input: K[]): T;
}
export { MultipartFileParser } from "./multipart-file.parser";
export { InvoiceQueryParser } from "./invoice-query.parser";
export { DashboardQueryParser } from "./dashboard-query.parser";
