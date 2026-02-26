import { Invoice } from "@/domain/entities/invoice.entity";
import {
  ClientNumber,
  Money,
  Quantity,
  ReferenceMonth
} from "@/domain/value-objects";
import type { InvoiceModel } from "@/infrastructure/database/prisma/generated/prisma/models/Invoice";

export class PrismaInvoiceMapper {
  static toDomain(row: InvoiceModel): Invoice {
    return Invoice.reconstitute(row.id, row.createdAt, {
      clientNumber: ClientNumber.reconstitute(row.clientNumber),
      referenceMonth: ReferenceMonth.reconstitute(row.referenceMonth),
      electricEnergyQty: Quantity.reconstitute(row.electricEnergyQty),
      electricEnergyValue: Money.reconstitute(Number(row.electricEnergyValue)),
      sceeEnergyQty: Quantity.reconstitute(row.sceeEnergyQty),
      sceeEnergyValue: Money.reconstitute(Number(row.sceeEnergyValue)),
      compensatedEnergyQty: Quantity.reconstitute(row.compensatedEnergyQty),
      compensatedEnergyValue: Money.reconstitute(
        Number(row.compensatedEnergyValue)
      ),
      publicLightingContrib: Money.reconstitute(
        Number(row.publicLightingContrib)
      ),
      electricEnergyConsumption: Quantity.reconstitute(
        row.electricEnergyConsumption
      ),
      compensatedEnergy: Quantity.reconstitute(row.compensatedEnergy),
      totalValueWithoutGD: Money.reconstitute(Number(row.totalValueWithoutGD)),
      gdSavings: Money.reconstitute(Number(row.gdSavings))
    });
  }
}
