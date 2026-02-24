import type { InvoiceListItem } from "@/application/read-models";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import type { Invoice } from "@/domain/entities/invoice.entity";
import type { PrismaClient } from "@/infrastructure/database/prisma/generated/prisma/client";

export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(clientNumber?: string): Promise<InvoiceListItem[]> {
    const rows = await this.prisma.invoice.findMany({
      where: clientNumber ? { clientNumber } : undefined,
      orderBy: { createdAt: "desc" }
    });

    return rows.map((row) => ({
      id: row.id,
      clientNumber: row.clientNumber,
      referenceMonth: row.referenceMonth,
      electricEnergyQty: row.electricEnergyQty,
      electricEnergyValue: Number(row.electricEnergyValue),
      sceeEnergyQty: row.sceeEnergyQty,
      sceeEnergyValue: Number(row.sceeEnergyValue),
      compensatedEnergyQty: row.compensatedEnergyQty,
      compensatedEnergyValue: Number(row.compensatedEnergyValue),
      publicLightingContrib: Number(row.publicLightingContrib),
      electricEnergyConsumption: row.electricEnergyConsumption,
      compensatedEnergy: row.compensatedEnergy,
      totalValueWithoutGD: Number(row.totalValueWithoutGD),
      gdSavings: Number(row.gdSavings),
      createdAt: row.createdAt
    }));
  }

  async save(invoice: Invoice): Promise<Invoice> {
    await this.prisma.invoice.create({
      data: {
        id: invoice.id,
        clientNumber: invoice.clientNumber.getValue(),
        referenceMonth: invoice.referenceMonth.getValue(),
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
        createdAt: invoice.createdAt
      }
    });

    return invoice;
  }
}
