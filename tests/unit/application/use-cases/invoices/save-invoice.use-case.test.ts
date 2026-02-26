import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import type { ProcessedInvoiceData } from "@/application/use-cases/invoices/process-invoice-data.use-case";
import { SaveInvoiceUseCase } from "@/application/use-cases/invoices/save-invoice.use-case";
import { Invoice } from "@/domain/entities/invoice.entity";
import {
  ClientNumber,
  Money,
  Quantity,
  ReferenceMonth
} from "@/domain/value-objects";

const fixture: ProcessedInvoiceData = {
  clientNumber: "7202788900",
  referenceMonth: "JAN/2024",
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
  gdSavings: -20.0
};

const buildInvoice = () =>
  Invoice.create({
    clientNumber: ClientNumber.create(fixture.clientNumber),
    referenceMonth: ReferenceMonth.create(fixture.referenceMonth),
    electricEnergyQty: Quantity.create(fixture.electricEnergyQty),
    electricEnergyValue: Money.create(fixture.electricEnergyValue),
    sceeEnergyQty: Quantity.create(fixture.sceeEnergyQty),
    sceeEnergyValue: Money.create(fixture.sceeEnergyValue),
    compensatedEnergyQty: Quantity.create(fixture.compensatedEnergyQty),
    compensatedEnergyValue: Money.create(fixture.compensatedEnergyValue),
    publicLightingContrib: Money.create(fixture.publicLightingContrib),
    electricEnergyConsumption: Quantity.create(
      fixture.electricEnergyConsumption
    ),
    compensatedEnergy: Quantity.create(fixture.compensatedEnergy),
    totalValueWithoutGD: Money.create(fixture.totalValueWithoutGD),
    gdSavings: Money.create(fixture.gdSavings)
  });

describe("SaveInvoiceUseCase", () => {
  const mockRepo: InvoiceRepository = {
    save: vi.fn(),
    findAll: vi.fn(),
    aggregateEnergy: vi.fn(),
    aggregateFinancial: vi.fn()
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("calls repository.save() once and returns an InvoiceDto", async () => {
    const savedInvoice = buildInvoice();
    vi.mocked(mockRepo.save).mockResolvedValue(savedInvoice);

    const useCase = new SaveInvoiceUseCase(mockRepo);
    const dto = await useCase.execute(fixture);

    expect(mockRepo.save).toHaveBeenCalledOnce();
    expect(dto).toBeDefined();
  });

  it("passes a correctly constructed Invoice entity to repository.save()", async () => {
    const savedInvoice = buildInvoice();
    vi.mocked(mockRepo.save).mockResolvedValue(savedInvoice);

    const useCase = new SaveInvoiceUseCase(mockRepo);
    await useCase.execute(fixture);

    const passedInvoice = vi.mocked(mockRepo.save).mock
      .calls[0]?.[0] as Invoice;
    expect(passedInvoice).toBeInstanceOf(Invoice);
    expect(passedInvoice.clientNumber.getValue()).toBe(fixture.clientNumber);
    expect(passedInvoice.referenceMonth.toDisplay()).toBe(
      fixture.referenceMonth
    );
    expect(passedInvoice.electricEnergyConsumption.getValue()).toBe(
      fixture.electricEnergyConsumption
    );
  });

  it("returns a DTO with correct field values from the saved entity", async () => {
    const savedInvoice = buildInvoice();
    vi.mocked(mockRepo.save).mockResolvedValue(savedInvoice);

    const useCase = new SaveInvoiceUseCase(mockRepo);
    const dto = await useCase.execute(fixture);

    expect(dto.clientNumber).toBe(fixture.clientNumber);
    expect(dto.referenceMonth).toBe(fixture.referenceMonth);
    expect(dto.electricEnergyQty).toBe(fixture.electricEnergyQty);
    expect(dto.electricEnergyValue).toBe(fixture.electricEnergyValue);
    expect(dto.sceeEnergyQty).toBe(fixture.sceeEnergyQty);
    expect(dto.sceeEnergyValue).toBe(fixture.sceeEnergyValue);
    expect(dto.compensatedEnergyQty).toBe(fixture.compensatedEnergyQty);
    expect(dto.compensatedEnergyValue).toBe(fixture.compensatedEnergyValue);
    expect(dto.publicLightingContrib).toBe(fixture.publicLightingContrib);
    expect(dto.electricEnergyConsumption).toBe(
      fixture.electricEnergyConsumption
    );
    expect(dto.compensatedEnergy).toBe(fixture.compensatedEnergy);
    expect(dto.totalValueWithoutGD).toBe(fixture.totalValueWithoutGD);
    expect(dto.gdSavings).toBe(fixture.gdSavings);
    expect(typeof dto.id).toBe("string");
    expect(typeof dto.createdAt).toBe("string");
  });
});
