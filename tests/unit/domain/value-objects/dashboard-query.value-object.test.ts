import { describe, expect, it } from "vitest";
import { InvalidDashboardQueryError } from "@/domain/errors";
import { DashboardQuery } from "@/domain/value-objects";

describe("DashboardQuery", () => {
  it("parses valid input and converts dates", () => {
    const query = DashboardQuery.create({
      clientNumber: "7202788900",
      dateStart: "JAN/2024",
      dateEnd: "FEV/2024"
    });

    expect(query.clientNumber).toBe("7202788900");
    expect(query.dateStart?.toISOString()).toBe(
      new Date(Date.UTC(2024, 0, 1)).toISOString()
    );
    expect(query.dateEnd?.toISOString()).toBe(
      new Date(Date.UTC(2024, 1, 1)).toISOString()
    );
  });

  it("throws InvalidDashboardQueryError for invalid input", () => {
    expect(() =>
      DashboardQuery.create({
        clientNumber: "invalid",
        dateStart: "2024-01"
      })
    ).toThrow(InvalidDashboardQueryError);
  });
});
