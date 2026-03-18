import { describe, expect, it } from "vitest";
import { InvalidReferenceMonthError } from "@/domain/errors";
import { ReferenceMonth } from "@/domain/value-objects";

describe("ReferenceMonth", () => {
  it("creates and displays a valid reference month", () => {
    const ref = ReferenceMonth.create("JAN/2024");
    expect(ref.getValue().toISOString()).toBe(
      new Date(Date.UTC(2024, 0, 1)).toISOString()
    );
    expect(ref.toDisplay()).toBe("JAN/2024");
  });

  it("throws InvalidReferenceMonthError for invalid format", () => {
    expect(() => ReferenceMonth.create("2024-01")).toThrow(
      InvalidReferenceMonthError
    );
  });

  it("handles month boundaries", () => {
    const dec = ReferenceMonth.create("DEZ/2024");
    expect(dec.toDisplay()).toBe("DEZ/2024");

    const feb = ReferenceMonth.create("FEV/2024");
    expect(feb.toDisplay()).toBe("FEV/2024");
  });

  it("reconstitutes an existing reference month", () => {
    const date = new Date(Date.UTC(2025, 3, 1));
    const ref = ReferenceMonth.reconstitute(date);

    expect(ref.getValue()).toBe(date);
    expect(ref.toDisplay()).toBe("ABR/2025");
  });
});
