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
      electricEnergyQty: Math.round(result.electricEnergy.qty),
      electricEnergyValue: result.electricEnergy.value,
      sceeEnergyQty: Math.round(result.sceeEnergy.qty),
      sceeEnergyValue: result.sceeEnergy.value,
      compensatedEnergyQty: Math.round(result.compensatedEnergyGDI.qty),
      compensatedEnergyValue: result.compensatedEnergyGDI.value,
      publicLightingContrib: result.publicLightingContrib.value,
      electricEnergyConsumption: Math.round(
        result.electricEnergy.qty + result.sceeEnergy.qty
      ),
      compensatedEnergy: Math.round(result.compensatedEnergyGDI.qty),
      totalValueWithoutGD:
        result.electricEnergy.value +
        result.sceeEnergy.value +
        result.publicLightingContrib.value,
      gdSavings: result.compensatedEnergyGDI.value
    };
  }
}
