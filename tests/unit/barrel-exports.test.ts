import { describe, expect, it } from "vitest";

import { ErrorCode } from "@/application/dtos/index";
import { InvoiceMapper } from "@/application/mappers/index";
import { LlmError } from "@/application/interfaces/providers/index";
import { Invoice } from "@/domain/entities/index";
import { ErrorCode as DomainErrorCode } from "@/domain/enums/index";
import { DomainError } from "@/domain/errors/index";
import { InvoicesQuery } from "@/domain/value-objects/index";
import { PrismaInvoiceMapper } from "@/infrastructure/database/mappers/index";
import { HttpError } from "@/infrastructure/http/errors/index";
import { InvoiceQueryParser } from "@/infrastructure/http/parsers/index";
import { httpStatusFor } from "@/infrastructure/http/presenters/index";
import { limitSchema } from "@/shared/schemas/index";

describe("barrel index exports", () => {
  it("exports runtime symbols from index.ts modules", () => {
    expect(ErrorCode).toBeDefined();
    expect(InvoiceMapper).toBeDefined();
    expect(LlmError).toBeDefined();
    expect(Invoice).toBeDefined();
    expect(DomainErrorCode).toBeDefined();
    expect(DomainError).toBeDefined();
    expect(InvoicesQuery).toBeDefined();
    expect(PrismaInvoiceMapper).toBeDefined();
    expect(HttpError).toBeDefined();
    expect(InvoiceQueryParser).toBeDefined();
    expect(httpStatusFor).toBeDefined();
    expect(limitSchema).toBeDefined();
  });
});

