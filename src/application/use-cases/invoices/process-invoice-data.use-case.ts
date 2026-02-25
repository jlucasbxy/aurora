import type { InvoiceExtractionDto } from "@/application/dtos";
import Decimal from "decimal.js";

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
    const electricEnergyQty = new Decimal(result.electricEnergyQty);
    const sceeEnergyQty = new Decimal(result.sceeEnergyQty);
    const compensatedEnergyQty = new Decimal(result.compensatedEnergyQty);
    const electricEnergyValue = new Decimal(result.electricEnergyValue);
    const sceeEnergyValue = new Decimal(result.sceeEnergyValue);
    const publicLightingContrib = new Decimal(result.publicLightingContrib);
    const compensatedEnergyValue = new Decimal(result.compensatedEnergyValue);

    return {
      clientNumber: result.clientNumber,
      referenceMonth: result.referenceMonth,
      electricEnergyQty: electricEnergyQty.toDecimalPlaces(0).toNumber(),
      electricEnergyValue: electricEnergyValue.toNumber(),
      sceeEnergyQty: sceeEnergyQty.toDecimalPlaces(0).toNumber(),
      sceeEnergyValue: sceeEnergyValue.toNumber(),
      compensatedEnergyQty: compensatedEnergyQty.toDecimalPlaces(0).toNumber(),
      compensatedEnergyValue: compensatedEnergyValue.toNumber(),
      publicLightingContrib: publicLightingContrib.toNumber(),
      electricEnergyConsumption: electricEnergyQty
        .plus(sceeEnergyQty)
        .toDecimalPlaces(0)
        .toNumber(),
      compensatedEnergy: compensatedEnergyQty.toDecimalPlaces(0).toNumber(),
      totalValueWithoutGD: electricEnergyValue
        .plus(sceeEnergyValue)
        .plus(publicLightingContrib)
        .toNumber(),
      gdSavings: compensatedEnergyValue.toNumber()
    };
  }
}
