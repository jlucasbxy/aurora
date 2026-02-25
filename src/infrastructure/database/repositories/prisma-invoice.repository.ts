import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import type { InvoiceEnergyReadModel, InvoiceFinancialReadModel } from "@/application/read-models";
import { Invoice } from "@/domain/entities/invoice.entity";
import type { DashboardQuery, InvoicesQuery } from "@/domain/value-objects";
import { Money, Quantity } from "@/domain/value-objects";
import { PrismaInvoiceMapper } from "@/infrastructure/database/mappers";
import type { PrismaClient } from "@/infrastructure/database/prisma/generated/prisma/client";

export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(query: InvoicesQuery): Promise<Invoice[]> {
    const rows = await this.prisma.invoice.findMany({
      where: {
        ...(query.clientNumber && { clientNumber: query.clientNumber }),
        ...(query.referenceMonth && { referenceMonth: query.referenceMonth })
      },
      orderBy: { id: "desc" },
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
      take: query.limit + 1
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

  async aggregateEnergy(query: DashboardQuery): Promise<InvoiceEnergyReadModel> {
    const result = await this.prisma.invoice.aggregate({
      where: {
        ...(query.clientNumber && { clientNumber: query.clientNumber }),
        ...(query.referenceMonth && { referenceMonth: query.referenceMonth })
      },
      _sum: {
        electricEnergyConsumption: true,
        compensatedEnergy: true
      }
    });
    return {
      electricEnergyConsumption: Quantity.create(Number(result._sum.electricEnergyConsumption ?? 0)),
      compensatedEnergy: Quantity.create(Number(result._sum.compensatedEnergy ?? 0))
    };
  }

  async aggregateFinancial(query: DashboardQuery): Promise<InvoiceFinancialReadModel> {
    const result = await this.prisma.invoice.aggregate({
      where: {
        ...(query.clientNumber && { clientNumber: query.clientNumber }),
        ...(query.referenceMonth && { referenceMonth: query.referenceMonth })
      },
      _sum: {
        totalValueWithoutGD: true,
        gdSavings: true
      }
    });
    return {
      totalValueWithoutGD: Money.create(Number(result._sum.totalValueWithoutGD ?? 0)),
      gdSavings: Money.create(Number(result._sum.gdSavings ?? 0))
    };
  }
}
