import { describe, expect, it } from "vitest";
import { InvoicesQuery } from "@/domain/value-objects";
import { InvalidInvoicesQueryError } from "@/domain/errors";

describe("InvoicesQuery", () => {
  it("parses valid input and converts referenceMonth", () => {
    const query = InvoicesQuery.create({
      clientNumber: "7202788900",
      referenceMonth: "JAN/2024",
      cursor: "01944b1a-0000-7000-8000-000000000001",
      limit: 25
    });

    expect(query.clientNumber).toBe("7202788900");
    expect(query.cursor).toBe("01944b1a-0000-7000-8000-000000000001");
    expect(query.limit).toBe(25);
    expect(query.referenceMonth?.toISOString()).toBe(
      new Date(Date.UTC(2024, 0, 1)).toISOString()
    );
  });

  it("defaults limit to 10 when not provided", () => {
    const query = InvoicesQuery.create({
      clientNumber: "7202788900"
    });

    expect(query.limit).toBe(10);
  });

  it("throws InvalidInvoicesQueryError for invalid input", () => {
    expect(() =>
      InvoicesQuery.create({
        clientNumber: "invalid",
        limit: 0
      })
    ).toThrow(InvalidInvoicesQueryError);
  });
});
