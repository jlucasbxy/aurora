export type InvoiceExtractionResult = {
  clientNumber: string;
  referenceMonth: string;
  electricEnergy: { qty: number; value: number };
  sceeEnergy: { qty: number; value: number };
  compensatedEnergyGDI: { qty: number; value: number };
  publicLightingContrib: { value: number };
};

export interface LLMProvider {
  extractInvoiceData(pdfBuffer: Buffer): Promise<InvoiceExtractionResult>;
}
