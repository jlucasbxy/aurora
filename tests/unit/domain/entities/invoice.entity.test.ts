import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

const props = {
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
};

describe("Invoice", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("creates invoice with generated id and createdAt", () => {
    const invoice = Invoice.create(props);

    expect(invoice.id).toBe("01944b1a-0000-7000-8000-000000000001");
    expect(invoice.createdAt.toISOString()).toBe(fixedDate.toISOString());
    expect(invoice.clientNumber.getValue()).toBe("7202788900");
  });

  it("reconstitutes invoice with provided id and createdAt", () => {
    const createdAt = new Date("2024-02-01T00:00:00.000Z");
    const invoice = Invoice.reconstitute(
      "01944b1a-0000-7000-8000-000000000999",
      createdAt,
      props
    );

    expect(invoice.id).toBe("01944b1a-0000-7000-8000-000000000999");
    expect(invoice.createdAt.toISOString()).toBe(createdAt.toISOString());
  });
});
