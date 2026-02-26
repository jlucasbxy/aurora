import { describe, expect, it } from "vitest";
import { InvoiceFinancialMapper } from "@/application/mappers";
import { Money } from "@/domain/value-objects";

describe("InvoiceFinancialMapper", () => {
  it("maps financial read model to DTO", () => {
    const readModel = {
      totalValueWithoutGD: Money.create(85.0),
      gdSavings: Money.create(-20.0)
    };

    const dto = InvoiceFinancialMapper.toDto(readModel);

    expect(dto).toEqual({
      totalValueWithoutGD: 85.0,
      gdSavings: -20.0
    });
  });
});
