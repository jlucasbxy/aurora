import { z } from "zod";
import { HttpError } from "@/infrastructure/http/errors";
import { clientNumberSchema, referenceMonthSchema } from "@/shared/schemas";
import type { QueryDashboardDto } from "@/application/dtos/query-dashboard.dto";
import type { Parser } from "@/infrastructure/http/parsers";

const dashboardQuerySchema = z.object({
  clientNumber: clientNumberSchema.optional(),
  referenceMonth: referenceMonthSchema.optional()
});

export class DashboardQueryParser implements Parser<QueryDashboardDto> {
  parse(query: unknown): QueryDashboardDto {
    const result = dashboardQuerySchema.safeParse(query);

    if (!result.success) {
      const message = result.error.issues[0].message;
      throw new HttpError(400, "INVALID_QUERY_PARAMS", message);
    }

    return result.data;
  }
}
