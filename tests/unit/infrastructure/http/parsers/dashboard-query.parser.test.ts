import { describe, expect, it } from "vitest";
import { HttpError } from "@/infrastructure/http/errors";
import { DashboardQueryParser } from "@/infrastructure/http/parsers/dashboard-query.parser";

describe("DashboardQueryParser", () => {
  const parser = new DashboardQueryParser();

  it("parses valid query and params", () => {
    const result = parser.parse(
      { dateStart: "JAN/2024", dateEnd: "FEV/2024" },
      { clientNumber: "7202788900" }
    );

    expect(result).toEqual({
      clientNumber: "7202788900",
      dateStart: "JAN/2024",
      dateEnd: "FEV/2024"
    });
  });

  it("throws HttpError with details for invalid input", () => {
    expect(() =>
      parser.parse({ dateStart: "2024-01" }, { clientNumber: "invalid" })
    ).toThrow(HttpError);

    try {
      parser.parse({ dateStart: "2024-01" }, { clientNumber: "invalid" });
    } catch (error) {
      const httpError = error as HttpError;
      expect(httpError.statusCode).toBe(400);
      expect(httpError.code).toBe("INVALID_QUERY_PARAMS");
      expect(httpError.message.length).toBeGreaterThan(0);
    }
  });
});
