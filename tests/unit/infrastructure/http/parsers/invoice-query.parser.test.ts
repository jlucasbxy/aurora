import { describe, expect, it } from "vitest";
import { uuidv7 } from "uuidv7";
import { HttpError } from "@/infrastructure/http/errors";
import { InvoiceQueryParser } from "@/infrastructure/http/parsers/invoice-query.parser";

describe("InvoiceQueryParser", () => {
  const parser = new InvoiceQueryParser();

  it("parses valid query params", () => {
    const cursor = uuidv7();

    const result = parser.parse({
      clientNumber: "7202788900",
      referenceMonth: "JAN/2024",
      cursor,
      limit: "15"
    });

    expect(result).toEqual({
      clientNumber: "7202788900",
      referenceMonth: "JAN/2024",
      cursor,
      limit: 15
    });
  });

  it("parses an empty query object", () => {
    expect(parser.parse({})).toEqual({});
  });

  it("throws HttpError with details for invalid query params", () => {
    expect(() => parser.parse({ limit: 0 })).toThrow(HttpError);

    try {
      parser.parse({ limit: 0 });
    } catch (error) {
      const httpError = error as HttpError;
      expect(httpError.statusCode).toBe(400);
      expect(httpError.code).toBe("INVALID_QUERY_PARAMS");
      expect(httpError.message.length).toBeGreaterThan(0);
    }
  });
});

