import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InvoiceMapper } from "@/application/mappers";
import { Invoice } from "@/domain/entities";
import {
  ClientNumber,
  Money,
  Quantity,
  ReferenceMonth
} from "@/domain/value-objects";

vi.mock("uuidv7", () => ({
  uuidv7: vi.fn(() => "01944b1a-0000-7000-8000-000000000001")
}));

const fixedDate = new Date("2024-01-01T00:00:00.000Z");

describe("InvoiceMapper", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("maps Invoice to DTO with correct fields", () => {
    const invoice = Invoice.create({
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

    const dto = InvoiceMapper.toDto(invoice);

    expect(dto).toEqual({
      id: "01944b1a-0000-7000-8000-000000000001",
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
      gdSavings: -20.0,
      createdAt: fixedDate.toISOString()
    });
  });

  it("maps DTO back to Invoice with preserved id and createdAt", () => {
    const dto = {
      id: "01944b1a-0000-7000-8000-000000000123",
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
      gdSavings: -20.0,
      createdAt: "2024-01-02T00:00:00.000Z"
    };

    const invoice = InvoiceMapper.fromDto(dto);

    expect(invoice.id).toBe(dto.id);
    expect(invoice.createdAt.toISOString()).toBe(dto.createdAt);
    expect(invoice.clientNumber.getValue()).toBe(dto.clientNumber);
    expect(invoice.referenceMonth.toDisplay()).toBe(dto.referenceMonth);
    expect(invoice.electricEnergyConsumption.getValue()).toBe(
      dto.electricEnergyConsumption
    );
  });
});
