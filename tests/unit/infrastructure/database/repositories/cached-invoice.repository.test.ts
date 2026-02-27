import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { Invoice } from "@/domain/entities/invoice.entity";
import {
  ClientNumber,
  DashboardQuery,
  InvoicesQuery,
  Money,
  Quantity,
  ReferenceMonth
} from "@/domain/value-objects";
import { CachedInvoiceRepository } from "@/infrastructure/database/repositories/cached-invoice.repository";

const mockRedis = {
  get: vi.fn(),
  setex: vi.fn(),
  scan: vi.fn(),
  unlink: vi.fn()
};

const mockInner: InvoiceRepository = {
  findAll: vi.fn(),
  save: vi.fn(),
  aggregateEnergy: vi.fn(),
  aggregateFinancial: vi.fn()
};

function buildInvoice() {
  return Invoice.create({
    clientNumber: ClientNumber.create("7202788900"),
    referenceMonth: ReferenceMonth.create("JAN/2024"),
    electricEnergyQty: Quantity.create(100),
    electricEnergyValue: Money.create(50),
    sceeEnergyQty: Quantity.create(200),
    sceeEnergyValue: Money.create(25),
    compensatedEnergyQty: Quantity.create(150),
    compensatedEnergyValue: Money.create(-20),
    publicLightingContrib: Money.create(10),
    electricEnergyConsumption: Quantity.create(300),
    compensatedEnergy: Quantity.create(150),
    totalValueWithoutGD: Money.create(85),
    gdSavings: Money.create(-20)
  });
}

function buildInvoiceDto(invoice: Invoice) {
  return {
    id: invoice.id,
    clientNumber: invoice.clientNumber.getValue(),
    referenceMonth: invoice.referenceMonth.toDisplay(),
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
    createdAt: invoice.createdAt.toISOString()
  };
}

describe("CachedInvoiceRepository", () => {
  let repo: CachedInvoiceRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    mockRedis.scan.mockResolvedValue(["0", []]);
    repo = new CachedInvoiceRepository(mockInner, mockRedis as never);
  });

  describe("findAll", () => {
    const query = InvoicesQuery.create({ limit: 10 });

    it("returns cached invoices on cache hit", async () => {
      const invoice = buildInvoice();
      const dto = buildInvoiceDto(invoice);

      mockRedis.get.mockResolvedValue(JSON.stringify([dto]));

      const result = await repo.findAll(query);

      expect(result).toHaveLength(1);
      expect(result[0]?.clientNumber.getValue()).toBe("7202788900");
      expect(mockInner.findAll).not.toHaveBeenCalled();
    });

    it("falls back to inner repo on cache miss", async () => {
      const invoice = buildInvoice();
      mockRedis.get.mockResolvedValue(null);
      vi.mocked(mockInner.findAll).mockResolvedValue([invoice]);

      const result = await repo.findAll(query);

      expect(result).toHaveLength(1);
      expect(mockInner.findAll).toHaveBeenCalledOnce();
      expect(mockRedis.setex).toHaveBeenCalledOnce();
    });

    it("falls back to inner repo on malformed cache", async () => {
      const invoice = buildInvoice();
      mockRedis.get.mockResolvedValue("not-valid-json{{{");
      vi.mocked(mockInner.findAll).mockResolvedValue([invoice]);

      const result = await repo.findAll(query);

      expect(result).toHaveLength(1);
      expect(mockInner.findAll).toHaveBeenCalledOnce();
    });

    it("falls back to inner repo when cache has invalid schema", async () => {
      const invoice = buildInvoice();
      mockRedis.get.mockResolvedValue(JSON.stringify([{ bad: "data" }]));
      vi.mocked(mockInner.findAll).mockResolvedValue([invoice]);

      const result = await repo.findAll(query);

      expect(result).toHaveLength(1);
      expect(mockInner.findAll).toHaveBeenCalledOnce();
    });
  });

  describe("save", () => {
    it("delegates to inner repo and invalidates cache", async () => {
      const invoice = buildInvoice();
      vi.mocked(mockInner.save).mockResolvedValue(invoice);
      mockRedis.scan
        .mockResolvedValueOnce(["0", ["invoices:7202788900:list:a"]])
        .mockResolvedValueOnce(["0", ["invoices:all:list:a"]]);
      mockRedis.unlink.mockResolvedValue(1);

      const result = await repo.save(invoice);

      expect(mockInner.save).toHaveBeenCalledWith(invoice);
      expect(result).toBe(invoice);
      expect(mockRedis.scan).toHaveBeenCalledTimes(2);
    });
  });

  describe("aggregateEnergy", () => {
    const query = DashboardQuery.create({ clientNumber: "7202788900" });

    it("returns cached energy data on cache hit", async () => {
      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          electricEnergyConsumption: 300,
          compensatedEnergy: 150
        })
      );

      const result = await repo.aggregateEnergy(query);

      expect(result).not.toBeNull();
      expect(result?.electricEnergyConsumption.getValue()).toBe(300);
      expect(result?.compensatedEnergy.getValue()).toBe(150);
      expect(mockInner.aggregateEnergy).not.toHaveBeenCalled();
    });

    it("falls back to inner repo on cache miss", async () => {
      mockRedis.get.mockResolvedValue(null);
      vi.mocked(mockInner.aggregateEnergy).mockResolvedValue({
        electricEnergyConsumption: Quantity.reconstitute(300),
        compensatedEnergy: Quantity.reconstitute(150)
      });

      const result = await repo.aggregateEnergy(query);

      expect(result).not.toBeNull();
      expect(mockInner.aggregateEnergy).toHaveBeenCalledOnce();
      expect(mockRedis.setex).toHaveBeenCalledOnce();
    });

    it("returns null when inner repo returns null", async () => {
      mockRedis.get.mockResolvedValue(null);
      vi.mocked(mockInner.aggregateEnergy).mockResolvedValue(null);

      const result = await repo.aggregateEnergy(query);

      expect(result).toBeNull();
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });
  });

  describe("aggregateFinancial", () => {
    const query = DashboardQuery.create({ clientNumber: "7202788900" });

    it("returns cached financial data on cache hit", async () => {
      mockRedis.get.mockResolvedValue(
        JSON.stringify({ totalValueWithoutGD: 85, gdSavings: -20 })
      );

      const result = await repo.aggregateFinancial(query);

      expect(result).not.toBeNull();
      expect(result?.totalValueWithoutGD.getValue()).toBe(85);
      expect(result?.gdSavings.getValue()).toBe(-20);
      expect(mockInner.aggregateFinancial).not.toHaveBeenCalled();
    });

    it("falls back to inner repo on cache miss", async () => {
      mockRedis.get.mockResolvedValue(null);
      vi.mocked(mockInner.aggregateFinancial).mockResolvedValue({
        totalValueWithoutGD: Money.reconstitute(85),
        gdSavings: Money.reconstitute(-20)
      });

      const result = await repo.aggregateFinancial(query);

      expect(result).not.toBeNull();
      expect(mockInner.aggregateFinancial).toHaveBeenCalledOnce();
      expect(mockRedis.setex).toHaveBeenCalledOnce();
    });

    it("returns null when inner repo returns null", async () => {
      mockRedis.get.mockResolvedValue(null);
      vi.mocked(mockInner.aggregateFinancial).mockResolvedValue(null);

      const result = await repo.aggregateFinancial(query);

      expect(result).toBeNull();
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });
  });
});
