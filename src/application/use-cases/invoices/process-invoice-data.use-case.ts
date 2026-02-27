import Decimal from "decimal.js";
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
    const electricEnergyValue = new Decimal(result.electricEnergyValue);
    const sceeEnergyValue = new Decimal(result.sceeEnergyValue);
    const publicLightingContrib = new Decimal(result.publicLightingContrib);
    const compensatedEnergyValue = new Decimal(result.compensatedEnergyValue);

    return Invoice.create({
      clientNumber: ClientNumber.create(result.clientNumber),
      referenceMonth: ReferenceMonth.create(result.referenceMonth),
      electricEnergyQty: Quantity.create(result.electricEnergyQty),
      electricEnergyValue: Money.create(electricEnergyValue.toNumber()),
      sceeEnergyQty: Quantity.create(result.sceeEnergyQty),
      sceeEnergyValue: Money.create(sceeEnergyValue.toNumber()),
      compensatedEnergyQty: Quantity.create(result.compensatedEnergyQty),
      compensatedEnergyValue: Money.create(compensatedEnergyValue.toNumber()),
      publicLightingContrib: Money.create(publicLightingContrib.toNumber()),
      electricEnergyConsumption: Quantity.create(
        result.electricEnergyQty + result.sceeEnergyQty
      ),
      compensatedEnergy: Quantity.create(result.compensatedEnergyQty),
      totalValueWithoutGD: Money.create(
        electricEnergyValue
          .plus(sceeEnergyValue)
          .plus(publicLightingContrib)
          .toNumber()
      ),
      gdSavings: Money.create(compensatedEnergyValue.toNumber())
    });
  }
}
