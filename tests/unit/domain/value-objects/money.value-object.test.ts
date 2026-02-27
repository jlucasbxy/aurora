import { describe, expect, it } from "vitest";
import { InvalidMoneyError } from "@/domain/errors";
import { Money } from "@/domain/value-objects";

describe("Money", () => {
  it("creates with a valid number", () => {
    const value = 123.45;
    const money = Money.create(value);
    expect(money.getValue()).toBe(value);
  });

  it("throws InvalidMoneyError for invalid value", () => {
    expect(() => Money.create("invalid" as unknown as number)).toThrow(
      InvalidMoneyError
    );
  });

  it("adds values with precision", () => {
    const result = Money.create(0.1).plus(Money.create(0.2));
    expect(result.getValue()).toBe(0.3);
  });

  it("subtracts values with precision", () => {
    const result = Money.create(1.0).minus(Money.create(0.9));
    expect(result.getValue()).toBe(0.1);
  });
});
