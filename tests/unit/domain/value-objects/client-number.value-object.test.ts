import { describe, expect, it } from "vitest";
import { ClientNumber } from "@/domain/value-objects";
import { InvalidClientNumberError } from "@/domain/errors";

describe("ClientNumber", () => {
  it("creates with a valid 10-digit number", () => {
    const value = "7202788900";
    const clientNumber = ClientNumber.create(value);
    expect(clientNumber.getValue()).toBe(value);
  });

  it("throws InvalidClientNumberError for invalid number", () => {
    expect(() => ClientNumber.create("not-a-number")).toThrow(
      InvalidClientNumberError
    );
  });
});
