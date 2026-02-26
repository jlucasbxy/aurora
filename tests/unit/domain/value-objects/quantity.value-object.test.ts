import { describe, expect, it } from "vitest";
import { Quantity } from "@/domain/value-objects";
import { InvalidQuantityError } from "@/domain/errors";

describe("Quantity", () => {
  it("creates with a valid integer", () => {
    const value = 10;
    const quantity = Quantity.create(value);
    expect(quantity.getValue()).toBe(value);
  });

  it("throws InvalidQuantityError for non-integer value", () => {
    expect(() => Quantity.create(10.5)).toThrow(InvalidQuantityError);
  });
});
