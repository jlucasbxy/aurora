import type { InvoiceExtractionDto } from "@/application/dtos";
import { Invoice } from "@/domain/entities/invoice.entity";
import {
  ClientNumber,
  Money,
  Quantity,
  ReferenceMonth
} from "@/domain/value-objects";

export class ProcessInvoiceDataUseCase {
  execute(result: InvoiceExtractionDto): Invoice {
    const electricEnergyValue = Money.create(result.electricEnergyValue);
    const sceeEnergyValue = Money.create(result.sceeEnergyValue);
    const publicLightingContrib = Money.create(result.publicLightingContrib);
    const compensatedEnergyValue = Money.create(result.compensatedEnergyValue);

    return Invoice.create({
      clientNumber: ClientNumber.create(result.clientNumber),
      referenceMonth: ReferenceMonth.create(result.referenceMonth),
      electricEnergyQty: Quantity.create(result.electricEnergyQty),
      electricEnergyValue,
      sceeEnergyQty: Quantity.create(result.sceeEnergyQty),
      sceeEnergyValue,
      compensatedEnergyQty: Quantity.create(result.compensatedEnergyQty),
      compensatedEnergyValue,
      publicLightingContrib,
      electricEnergyConsumption: Quantity.create(
        result.electricEnergyQty + result.sceeEnergyQty
      ),
      compensatedEnergy: Quantity.create(result.compensatedEnergyQty),
      totalValueWithoutGD: electricEnergyValue
        .plus(sceeEnergyValue)
        .plus(publicLightingContrib),
      gdSavings: compensatedEnergyValue
    });
  }
}
