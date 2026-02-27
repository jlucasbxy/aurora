import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import type {
  InvoiceEnergyReadModel,
  InvoiceFinancialReadModel
} from "@/application/read-models";
import type { Invoice } from "@/domain/entities/invoice.entity";
import { InvoiceAlreadyExistsError } from "@/domain/errors";
import type { DashboardQuery, InvoicesQuery } from "@/domain/value-objects";
import { Money, Quantity } from "@/domain/value-objects";
import { PrismaInvoiceMapper } from "@/infrastructure/database/mappers";
import type { PrismaClient } from "@/infrastructure/database/prisma/generated/prisma/client";

export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(query: InvoicesQuery): Promise<Invoice[]> {
    const rows = await this.prisma.invoice.findMany({
      where: {
        clientNumber: query.clientNumber,
        ...(query.referenceMonth && { referenceMonth: query.referenceMonth })
      },
      orderBy: { id: "desc" },
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
      take: query.limit + 1
    });

    return rows.map((row) => PrismaInvoiceMapper.toDomain(row));
  }

  async save(invoice: Invoice): Promise<Invoice> {
    try {
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
          electricEnergyConsumption:
            invoice.electricEnergyConsumption.getValue(),
          compensatedEnergy: invoice.compensatedEnergy.getValue(),
          totalValueWithoutGD: invoice.totalValueWithoutGD.getValue(),
          gdSavings: invoice.gdSavings.getValue(),
          createdAt: invoice.createdAt
        },
        select: {
          id: true
        }
      });
    } catch (error: unknown) {
      if (this.isUniqueConstraintViolation(error)) {
        const fields = this.extractConstraintFields(error);
        const isClientAndMonthUniqueViolation =
          fields.includes("clientNumber") && fields.includes("referenceMonth");

        if (isClientAndMonthUniqueViolation) {
          throw new InvoiceAlreadyExistsError();
        }
      }

      throw error;
    }

    return invoice;
  }

  private isUniqueConstraintViolation(
    error: unknown
  ): error is { code: "P2002"; meta?: Record<string, unknown> } {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    );
  }

  private extractConstraintFields(error: {
    meta?: Record<string, unknown>;
  }): string[] {
    const meta = error.meta;
    if (!meta) return [];

    // Standard Prisma engine: meta.target is an array of field names
    if (Array.isArray(meta.target)) {
      return meta.target.map((f: string) => f.replace(/^"|"$/g, ""));
    }

    // Driver adapter: fields are nested under meta.driverAdapterError.cause.constraint.fields
    const driverError = meta.driverAdapterError as
      | Record<string, unknown>
      | undefined;
    const cause = driverError?.cause as Record<string, unknown> | undefined;
    const constraint = cause?.constraint as Record<string, unknown> | undefined;
    if (Array.isArray(constraint?.fields)) {
      return constraint.fields.map((f: string) => f.replace(/^"|"$/g, ""));
    }

    return [];
  }

  async aggregateEnergy(
    query: DashboardQuery
  ): Promise<InvoiceEnergyReadModel | null> {
    if (!(await this.clientExists(query.clientNumber))) return null;

    const result = await this.prisma.invoice.aggregate({
      where: {
        clientNumber: query.clientNumber,
        ...((query.dateStart || query.dateEnd) && {
          referenceMonth: {
            ...(query.dateStart && { gte: query.dateStart }),
            ...(query.dateEnd && { lte: query.dateEnd })
          }
        })
      },
      _sum: {
        electricEnergyConsumption: true,
        compensatedEnergy: true
      }
    });

    return {
      electricEnergyConsumption: Quantity.reconstitute(
        Number(result._sum.electricEnergyConsumption ?? 0)
      ),
      compensatedEnergy: Quantity.reconstitute(
        Number(result._sum.compensatedEnergy ?? 0)
      )
    };
  }

  async aggregateFinancial(
    query: DashboardQuery
  ): Promise<InvoiceFinancialReadModel | null> {
    if (!(await this.clientExists(query.clientNumber))) return null;

    const result = await this.prisma.invoice.aggregate({
      where: {
        clientNumber: query.clientNumber,
        ...((query.dateStart || query.dateEnd) && {
          referenceMonth: {
            ...(query.dateStart && { gte: query.dateStart }),
            ...(query.dateEnd && { lte: query.dateEnd })
          }
        })
      },
      _sum: {
        totalValueWithoutGD: true,
        gdSavings: true
      }
    });

    return {
      totalValueWithoutGD: Money.reconstitute(
        Number(result._sum.totalValueWithoutGD ?? 0)
      ),
      gdSavings: Money.reconstitute(Number(result._sum.gdSavings ?? 0))
    };
  }

  private async clientExists(clientNumber: string): Promise<boolean> {
    const record = await this.prisma.invoice.findFirst({
      where: { clientNumber },
      select: { id: true }
    });
    return record !== null;
  }
}
