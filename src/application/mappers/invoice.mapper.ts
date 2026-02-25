import type { InvoiceDto } from "@/application/dtos";
import type { Invoice } from "@/domain/entities/invoice.entity";

export class InvoiceMapper {
  static toDto(invoice: Invoice): InvoiceDto {
    return {
      id: invoice.id,
      clientNumber: invoice.clientNumber.getValue(),
      referenceMonth: invoice.referenceMonth.toDisplay(),
      electricEnergyQty: invoice.electricEnergyQty.getValue(),
      electricEnergyValue: invoice.electricEnergyValue.getValue(),
      sceeEnergyQty: invoice.sceeEnergyQty.getValue(),
      sceeEnergyValue: invoice.sceeEnergyValue.getValue(),
      compensatedEnergyQty: invoice.compensatedEnergyQty.getValue(),
      compensatedEnergyValue: invoice.compensatedEnergyValue.getValue(),
      publicLightingContrib: invoice.publicLightingContrib.getValue(),
      electricEnergyConsumption: invoice.electricEnergyConsumption.getValue(),
      compensatedEnergy: invoice.compensatedEnergy.getValue(),
      totalValueWithoutGD: invoice.totalValueWithoutGD.getValue(),
      gdSavings: invoice.gdSavings.getValue(),
      createdAt: invoice.createdAt.toISOString()
    };
  }
}
