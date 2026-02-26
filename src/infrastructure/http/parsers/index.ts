export interface Parser<T, K = unknown> {
  parse(...input: K[]): T;
}
export { DashboardQueryParser } from "./dashboard-query.parser";
export { InvoiceQueryParser } from "./invoice-query.parser";
export { MultipartFileParser } from "./multipart-file.parser";
