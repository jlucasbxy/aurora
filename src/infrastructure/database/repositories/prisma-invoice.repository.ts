import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { Invoice } from "@/domain/entities/invoice.entity";
import { PrismaInvoiceMapper } from "@/infrastructure/database/mappers";
import type { PrismaClient } from "@/infrastructure/database/prisma/generated/prisma/client";

export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(clientNumber?: string): Promise<Invoice[]> {
    const rows = await this.prisma.invoice.findMany({
      where: clientNumber ? { clientNumber } : undefined,
      orderBy: { createdAt: "desc" }
    });

    return rows.map((row) => PrismaInvoiceMapper.toDomain(row));
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
