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
});
