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
      clientNumber: ClientNumber.create(row.clientNumber),
      referenceMonth: ReferenceMonth.create(row.referenceMonth),
      electricEnergyQty: Quantity.create(row.electricEnergyQty),
      electricEnergyValue: Money.create(Number(row.electricEnergyValue)),
      sceeEnergyQty: Quantity.create(row.sceeEnergyQty),
      sceeEnergyValue: Money.create(Number(row.sceeEnergyValue)),
      compensatedEnergyQty: Quantity.create(row.compensatedEnergyQty),
      compensatedEnergyValue: Money.create(Number(row.compensatedEnergyValue)),
      publicLightingContrib: Money.create(Number(row.publicLightingContrib)),
      electricEnergyConsumption: Quantity.create(row.electricEnergyConsumption),
      compensatedEnergy: Quantity.create(row.compensatedEnergy),
      totalValueWithoutGD: Money.create(Number(row.totalValueWithoutGD)),
      gdSavings: Money.create(Number(row.gdSavings))
    });
  }
}
