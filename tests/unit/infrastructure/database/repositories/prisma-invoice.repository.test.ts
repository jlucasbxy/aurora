import { beforeEach, describe, expect, it, vi } from "vitest";
import { Invoice } from "@/domain/entities/invoice.entity";
import { InvoiceAlreadyExistsError } from "@/domain/errors";
import {
  ClientNumber,
  DashboardQuery,
  InvoicesQuery,
  Money,
  Quantity,
  ReferenceMonth
} from "@/domain/value-objects";
import { PrismaInvoiceRepository } from "@/infrastructure/database/repositories/prisma-invoice.repository";

const buildInvoice = () =>
  Invoice.create({
    clientNumber: ClientNumber.create("7202788900"),
    referenceMonth: ReferenceMonth.create("JAN/2024"),
    electricEnergyQty: Quantity.create(100),
    electricEnergyValue: Money.create(50.0),
    sceeEnergyQty: Quantity.create(200),
    sceeEnergyValue: Money.create(25.0),
    compensatedEnergyQty: Quantity.create(150),
    compensatedEnergyValue: Money.create(-20.0),
    publicLightingContrib: Money.create(10.0),
    electricEnergyConsumption: Quantity.create(300),
    compensatedEnergy: Quantity.create(150),
    totalValueWithoutGD: Money.create(85.0),
    gdSavings: Money.create(-20.0)
  });

const buildInvoiceRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: "01944b1a-0000-7000-8000-000000000999",
  clientNumber: "7202788900",
  referenceMonth: ReferenceMonth.create("JAN/2024").getValue(),
  electricEnergyQty: 100,
  electricEnergyValue: 50.0,
  sceeEnergyQty: 200,
  sceeEnergyValue: 25.0,
  compensatedEnergyQty: 150,
  compensatedEnergyValue: -20.0,
  publicLightingContrib: 10.0,
  electricEnergyConsumption: 300,
  compensatedEnergy: 150,
  totalValueWithoutGD: 85.0,
  gdSavings: -20.0,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  ...overrides
});

describe("PrismaInvoiceRepository", () => {
  const prisma = {
    invoice: {
      findMany: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
      findFirst: vi.fn()
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("persists invoice on success", async () => {
    const invoice = buildInvoice();
    prisma.invoice.create.mockResolvedValue({ id: invoice.id });

    const repository = new PrismaInvoiceRepository(prisma as never);

    await expect(repository.save(invoice)).resolves.toBe(invoice);
    expect(prisma.invoice.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
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
      }),
      select: { id: true }
    });
  });

  it("throws InvoiceAlreadyExistsError when unique client/month constraint is violated", async () => {
    prisma.invoice.create.mockRejectedValue({
      code: "P2002",
      meta: { target: ["clientNumber", "referenceMonth"] }
    });

    const repository = new PrismaInvoiceRepository(prisma as never);

    await expect(repository.save(buildInvoice())).rejects.toBeInstanceOf(
      InvoiceAlreadyExistsError
    );
  });

  it("throws InvoiceAlreadyExistsError when driver adapter reports unique constraint violation", async () => {
    prisma.invoice.create.mockRejectedValue({
      code: "P2002",
      meta: {
        modelName: "Invoice",
        driverAdapterError: {
          cause: {
            constraint: {
              fields: ['"clientNumber"', '"referenceMonth"']
            }
          }
        }
      }
    });

    const repository = new PrismaInvoiceRepository(prisma as never);

    await expect(repository.save(buildInvoice())).rejects.toBeInstanceOf(
      InvoiceAlreadyExistsError
    );
  });

  it("rethrows unknown persistence errors", async () => {
    const persistenceError = new Error("database unavailable");
    prisma.invoice.create.mockRejectedValue(persistenceError);

    const repository = new PrismaInvoiceRepository(prisma as never);

    await expect(repository.save(buildInvoice())).rejects.toBe(
      persistenceError
    );
  });

  it("findAll queries prisma with pagination and maps rows", async () => {
    const row = buildInvoiceRow();
    prisma.invoice.findMany.mockResolvedValue([row]);

    const repository = new PrismaInvoiceRepository(prisma as never);

    const query = InvoicesQuery.create({
      clientNumber: row.clientNumber as string,
      limit: 10
    });
    const result = await repository.findAll(query);

    expect(prisma.invoice.findMany).toHaveBeenCalledWith({
      where: { clientNumber: row.clientNumber },
      orderBy: { id: "desc" },
      take: 11
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(row.id);
    expect(result[0]?.clientNumber.getValue()).toBe(row.clientNumber);
    expect(result[0]?.referenceMonth.getValue().toISOString()).toBe(
      (row.referenceMonth as Date).toISOString()
    );
  });

  it("findAll includes cursor and referenceMonth filters when provided", async () => {
    const row = buildInvoiceRow();
    prisma.invoice.findMany.mockResolvedValue([row]);

    const repository = new PrismaInvoiceRepository(prisma as never);

    const cursor = "01944b1a-0000-7000-8000-000000000001";
    const referenceMonth = "JAN/2024";
    const query = InvoicesQuery.create({
      clientNumber: row.clientNumber as string,
      cursor,
      referenceMonth,
      limit: 5
    });

    await repository.findAll(query);

    expect(prisma.invoice.findMany).toHaveBeenCalledWith({
      where: {
        clientNumber: row.clientNumber,
        referenceMonth: ReferenceMonth.create(referenceMonth).getValue()
      },
      orderBy: { id: "desc" },
      cursor: { id: cursor },
      skip: 1,
      take: 6
    });
  });

  it("aggregateEnergy returns null when client has no invoices", async () => {
    prisma.invoice.findFirst.mockResolvedValue(null);

    const repository = new PrismaInvoiceRepository(prisma as never);
    const query = DashboardQuery.create({ clientNumber: "7202788900" });

    await expect(repository.aggregateEnergy(query)).resolves.toBeNull();
    expect(prisma.invoice.aggregate).not.toHaveBeenCalled();
  });

  it("aggregateEnergy aggregates with date range when client exists", async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: "any" });
    prisma.invoice.aggregate.mockResolvedValue({
      _sum: { electricEnergyConsumption: 300, compensatedEnergy: 150 }
    });

    const repository = new PrismaInvoiceRepository(prisma as never);

    const dateStart = "JAN/2024";
    const dateEnd = "FEV/2024";
    const query = DashboardQuery.create({
      clientNumber: "7202788900",
      dateStart,
      dateEnd
    });

    const result = await repository.aggregateEnergy(query);

    expect(prisma.invoice.aggregate).toHaveBeenCalledWith({
      where: {
        clientNumber: query.clientNumber,
        referenceMonth: {
          gte: ReferenceMonth.create(dateStart).getValue(),
          lte: ReferenceMonth.create(dateEnd).getValue()
        }
      },
      _sum: {
        electricEnergyConsumption: true,
        compensatedEnergy: true
      }
    });
    expect(result?.electricEnergyConsumption.getValue()).toBe(300);
    expect(result?.compensatedEnergy.getValue()).toBe(150);
  });

  it("aggregateEnergy aggregates without date filters when client exists", async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: "any" });
    prisma.invoice.aggregate.mockResolvedValue({
      _sum: { electricEnergyConsumption: 300, compensatedEnergy: 150 }
    });

    const repository = new PrismaInvoiceRepository(prisma as never);
    const query = DashboardQuery.create({ clientNumber: "7202788900" });

    const result = await repository.aggregateEnergy(query);

    expect(prisma.invoice.aggregate).toHaveBeenCalledWith({
      where: { clientNumber: query.clientNumber },
      _sum: {
        electricEnergyConsumption: true,
        compensatedEnergy: true
      }
    });
    expect(result?.electricEnergyConsumption.getValue()).toBe(300);
    expect(result?.compensatedEnergy.getValue()).toBe(150);
  });

  it("aggregateEnergy supports only dateStart and defaults sums to zero", async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: "any" });
    prisma.invoice.aggregate.mockResolvedValue({
      _sum: { electricEnergyConsumption: null, compensatedEnergy: null }
    });

    const repository = new PrismaInvoiceRepository(prisma as never);

    const dateStart = "JAN/2024";
    const query = DashboardQuery.create({
      clientNumber: "7202788900",
      dateStart
    });

    const result = await repository.aggregateEnergy(query);

    expect(prisma.invoice.aggregate).toHaveBeenCalledWith({
      where: {
        clientNumber: query.clientNumber,
        referenceMonth: {
          gte: ReferenceMonth.create(dateStart).getValue()
        }
      },
      _sum: {
        electricEnergyConsumption: true,
        compensatedEnergy: true
      }
    });
    expect(result?.electricEnergyConsumption.getValue()).toBe(0);
    expect(result?.compensatedEnergy.getValue()).toBe(0);
  });

  it("aggregateFinancial returns null when client has no invoices", async () => {
    prisma.invoice.findFirst.mockResolvedValue(null);

    const repository = new PrismaInvoiceRepository(prisma as never);
    const query = DashboardQuery.create({ clientNumber: "7202788900" });

    await expect(repository.aggregateFinancial(query)).resolves.toBeNull();
    expect(prisma.invoice.aggregate).not.toHaveBeenCalled();
  });

  it("aggregateFinancial defaults sums to zero when prisma returns nulls", async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: "any" });
    prisma.invoice.aggregate.mockResolvedValue({
      _sum: { totalValueWithoutGD: null, gdSavings: null }
    });

    const repository = new PrismaInvoiceRepository(prisma as never);
    const query = DashboardQuery.create({ clientNumber: "7202788900" });

    const result = await repository.aggregateFinancial(query);

    expect(result?.totalValueWithoutGD.getValue()).toBe(0);
    expect(result?.gdSavings.getValue()).toBe(0);
  });

  it("aggregateFinancial supports only dateStart filters", async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: "any" });
    prisma.invoice.aggregate.mockResolvedValue({
      _sum: { totalValueWithoutGD: 85.0, gdSavings: -20.0 }
    });

    const repository = new PrismaInvoiceRepository(prisma as never);

    const dateStart = "JAN/2024";
    const query = DashboardQuery.create({
      clientNumber: "7202788900",
      dateStart
    });

    const result = await repository.aggregateFinancial(query);

    expect(prisma.invoice.aggregate).toHaveBeenCalledWith({
      where: {
        clientNumber: query.clientNumber,
        referenceMonth: {
          gte: ReferenceMonth.create(dateStart).getValue()
        }
      },
      _sum: {
        totalValueWithoutGD: true,
        gdSavings: true
      }
    });
    expect(result?.totalValueWithoutGD.getValue()).toBe(85);
    expect(result?.gdSavings.getValue()).toBe(-20);
  });

  it("aggregateFinancial supports only dateEnd filters", async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: "any" });
    prisma.invoice.aggregate.mockResolvedValue({
      _sum: { totalValueWithoutGD: 85.0, gdSavings: -20.0 }
    });

    const repository = new PrismaInvoiceRepository(prisma as never);

    const dateEnd = "FEV/2024";
    const query = DashboardQuery.create({
      clientNumber: "7202788900",
      dateEnd
    });

    const result = await repository.aggregateFinancial(query);

    expect(prisma.invoice.aggregate).toHaveBeenCalledWith({
      where: {
        clientNumber: query.clientNumber,
        referenceMonth: {
          lte: ReferenceMonth.create(dateEnd).getValue()
        }
      },
      _sum: {
        totalValueWithoutGD: true,
        gdSavings: true
      }
    });
    expect(result?.totalValueWithoutGD.getValue()).toBe(85);
    expect(result?.gdSavings.getValue()).toBe(-20);
  });
});
