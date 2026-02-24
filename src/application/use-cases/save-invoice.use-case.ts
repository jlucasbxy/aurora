import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import type { ProcessedInvoiceData } from "@/application/use-cases/process-invoice-data.use-case";
import { Invoice } from "@/domain/entities/invoice.entity";
import {
  ClientNumber,
  Money,
  Quantity,
  ReferenceMonth
} from "@/domain/value-objects";

export class SaveInvoiceUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  execute(data: ProcessedInvoiceData): Promise<Invoice> {
    const invoice = Invoice.create({
      clientNumber: ClientNumber.create(data.clientNumber),
      referenceMonth: ReferenceMonth.create(data.referenceMonth),
      electricEnergyQty: Quantity.create(data.electricEnergyQty),
      electricEnergyValue: Money.create(data.electricEnergyValue),
      sceeEnergyQty: Quantity.create(data.sceeEnergyQty),
      sceeEnergyValue: Money.create(data.sceeEnergyValue),
      compensatedEnergyQty: Quantity.create(data.compensatedEnergyQty),
      compensatedEnergyValue: Money.create(data.compensatedEnergyValue),
      publicLightingContrib: Money.create(data.publicLightingContrib),
      electricEnergyConsumption: Quantity.create(
        data.electricEnergyConsumption
      ),
      compensatedEnergy: Quantity.create(data.compensatedEnergy),
      totalValueWithoutGD: Money.create(data.totalValueWithoutGD),
      gdSavings: Money.create(data.gdSavings)
    });

    return this.invoiceRepository.save(invoice);
  }
}
