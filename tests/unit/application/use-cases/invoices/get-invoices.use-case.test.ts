import { beforeEach, describe, expect, it, vi } from "vitest";
import { uuidv7 } from "uuidv7";
import type { InvoiceRepository } from "@/application/interfaces/repositories";
import { GetInvoicesUseCase } from "@/application/use-cases/invoices/get-invoices.use-case";
import { Invoice } from "@/domain/entities";
import {
  ClientNumber,
  Money,
  Quantity,
  ReferenceMonth
} from "@/domain/value-objects";
import { InvoiceMapper } from "@/application/mappers";

const buildInvoice = (id: string, createdAt: Date) =>
  Invoice.reconstitute(id, createdAt, {
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

describe("GetInvoicesUseCase", () => {
  const mockRepo: InvoiceRepository = {
    save: vi.fn(),
    findAll: vi.fn(),
    aggregateEnergy: vi.fn(),
    aggregateFinancial: vi.fn()
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns paginated result without nextCursor when items <= limit", async () => {
    const invoice1 = buildInvoice(
      "01944b1a-0000-7000-8000-000000000001",
      new Date("2024-01-01T00:00:00.000Z")
    );
    const invoice2 = buildInvoice(
      "01944b1a-0000-7000-8000-000000000002",
      new Date("2024-01-02T00:00:00.000Z")
    );
    vi.mocked(mockRepo.findAll).mockResolvedValue([invoice1, invoice2]);

    const useCase = new GetInvoicesUseCase(mockRepo);
    const result = await useCase.execute({
      clientNumber: "7202788900",
      referenceMonth: "JAN/2024",
      limit: 2
    });

    expect(result.hasNextPage).toBe(false);
    expect(result.nextCursor).toBeNull();
    expect(result.data).toEqual([
      InvoiceMapper.toDto(invoice1),
      InvoiceMapper.toDto(invoice2)
    ]);
  });

  it("returns hasNextPage and nextCursor when items exceed limit", async () => {
    const invoice1 = buildInvoice(
      "01944b1a-0000-7000-8000-000000000001",
      new Date("2024-01-01T00:00:00.000Z")
    );
    const invoice2 = buildInvoice(
      "01944b1a-0000-7000-8000-000000000002",
      new Date("2024-01-02T00:00:00.000Z")
    );
    const invoice3 = buildInvoice(
      "01944b1a-0000-7000-8000-000000000003",
      new Date("2024-01-03T00:00:00.000Z")
    );

    vi.mocked(mockRepo.findAll).mockResolvedValue([
      invoice1,
      invoice2,
      invoice3
    ]);

    const useCase = new GetInvoicesUseCase(mockRepo);
    const result = await useCase.execute({
      clientNumber: "7202788900",
      referenceMonth: "JAN/2024",
      limit: 2
    });

    expect(result.hasNextPage).toBe(true);
    expect(result.nextCursor).toBe(invoice2.id);
    expect(result.data).toEqual([
      InvoiceMapper.toDto(invoice1),
      InvoiceMapper.toDto(invoice2)
    ]);
  });

  it("passes an InvoicesQuery built from the DTO to repository.findAll", async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const cursor = uuidv7();

    const useCase = new GetInvoicesUseCase(mockRepo);
    await useCase.execute({
      clientNumber: "7202788900",
      referenceMonth: "JAN/2024",
      cursor,
      limit: 15
    });

    const queryArg = vi.mocked(mockRepo.findAll).mock.calls[0]?.[0];
    expect(queryArg).toBeDefined();
    expect(queryArg?.clientNumber).toBe("7202788900");
    expect(queryArg?.cursor).toBe(cursor);
    expect(queryArg?.limit).toBe(15);
    expect(queryArg?.referenceMonth?.toISOString()).toBe(
      new Date(Date.UTC(2024, 0, 1)).toISOString()
    );
  });
});
