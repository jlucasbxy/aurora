import type { InvoiceDto } from "@/application/dtos";
import { Invoice } from "@/domain/entities/invoice.entity";
import {
  ClientNumber,
  Money,
  Quantity,
  ReferenceMonth
} from "@/domain/value-objects";

export const InvoiceMapper = {
  fromDto(dto: InvoiceDto): Invoice {
    return Invoice.reconstitute(dto.id, new Date(dto.createdAt), {
      clientNumber: ClientNumber.reconstitute(dto.clientNumber),
      referenceMonth: ReferenceMonth.create(dto.referenceMonth),
      electricEnergyQty: Quantity.reconstitute(dto.electricEnergyQty),
      electricEnergyValue: Money.reconstitute(dto.electricEnergyValue),
      sceeEnergyQty: Quantity.reconstitute(dto.sceeEnergyQty),
      sceeEnergyValue: Money.reconstitute(dto.sceeEnergyValue),
      compensatedEnergyQty: Quantity.reconstitute(dto.compensatedEnergyQty),
      compensatedEnergyValue: Money.reconstitute(dto.compensatedEnergyValue),
      publicLightingContrib: Money.reconstitute(dto.publicLightingContrib),
      electricEnergyConsumption: Quantity.reconstitute(
        dto.electricEnergyConsumption
      ),
      compensatedEnergy: Quantity.reconstitute(dto.compensatedEnergy),
      totalValueWithoutGD: Money.reconstitute(dto.totalValueWithoutGD),
      gdSavings: Money.reconstitute(dto.gdSavings)
    });
  },

  toDto(invoice: Invoice): InvoiceDto {
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
};
