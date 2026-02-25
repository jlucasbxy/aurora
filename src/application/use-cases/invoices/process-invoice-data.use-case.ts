import type { InvoiceExtractionDto } from "@/application/dtos";

export type ProcessedInvoiceData = {
  clientNumber: string;
  referenceMonth: string;
  electricEnergyQty: number;
  electricEnergyValue: number;
  sceeEnergyQty: number;
  sceeEnergyValue: number;
  compensatedEnergyQty: number;
  compensatedEnergyValue: number;
  publicLightingContrib: number;
  electricEnergyConsumption: number;
  compensatedEnergy: number;
  totalValueWithoutGD: number;
  gdSavings: number;
};

export class ProcessInvoiceDataUseCase {
  execute(result: InvoiceExtractionDto): ProcessedInvoiceData {
    return {
      clientNumber: result.clientNumber,
      referenceMonth: result.referenceMonth,
      electricEnergyQty: Math.round(result.electricEnergyQty),
      electricEnergyValue: result.electricEnergyValue,
      sceeEnergyQty: Math.round(result.sceeEnergyQty),
      sceeEnergyValue: result.sceeEnergyValue,
      compensatedEnergyQty: Math.round(result.compensatedEnergyQty),
      compensatedEnergyValue: result.compensatedEnergyValue,
      publicLightingContrib: result.publicLightingContrib,
      electricEnergyConsumption: Math.round(result.electricEnergyQty + result.sceeEnergyQty),
      compensatedEnergy: Math.round(result.compensatedEnergyQty),
      totalValueWithoutGD: result.electricEnergyValue + result.sceeEnergyValue + result.publicLightingContrib,
      gdSavings: result.compensatedEnergyValue,
    };
  }
}
