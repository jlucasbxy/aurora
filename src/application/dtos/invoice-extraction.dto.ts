export interface InvoiceExtractionDto {
  clientNumber: string;
  referenceMonth: string;
  electricEnergyQty: number;
  electricEnergyValue: number;
  sceeEnergyQty: number;
  sceeEnergyValue: number;
  compensatedEnergyQty: number;
  compensatedEnergyValue: number;
  publicLightingContrib: number;
}
