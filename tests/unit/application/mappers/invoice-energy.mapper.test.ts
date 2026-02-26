import { describe, expect, it } from "vitest";
import { InvoiceEnergyMapper } from "@/application/mappers";
import { Quantity } from "@/domain/value-objects";

describe("InvoiceEnergyMapper", () => {
  it("maps energy read model to DTO", () => {
    const readModel = {
      electricEnergyConsumption: Quantity.create(300),
      compensatedEnergy: Quantity.create(150)
    };

    const dto = InvoiceEnergyMapper.toDto(readModel);

    expect(dto).toEqual({
      electricEnergyConsumption: 300,
      compensatedEnergy: 150
    });
  });
});
