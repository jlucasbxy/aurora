import { beforeEach, describe, expect, it, vi } from "vitest";
import { Invoice } from "@/domain/entities/invoice.entity";
import { InvoiceAlreadyExistsError } from "@/domain/errors";
import {
  ClientNumber,
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

    await expect(repository.save(buildInvoice())).rejects.toBe(persistenceError);
  });
});
