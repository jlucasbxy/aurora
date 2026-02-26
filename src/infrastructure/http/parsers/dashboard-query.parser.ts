import { z } from "zod";
import type { QueryDashboardDto } from "@/application/dtos/query-dashboard.dto";
import { HttpError } from "@/infrastructure/http/errors";
import type { Parser } from "@/infrastructure/http/parsers";
import { clientNumberSchema, referenceMonthSchema } from "@/shared/schemas";

const dashboardQuerySchema = z.object({
  clientNumber: clientNumberSchema,
  dateStart: referenceMonthSchema.optional(),
  dateEnd: referenceMonthSchema.optional()
});

export class DashboardQueryParser implements Parser<QueryDashboardDto> {
  parse(...query: unknown[]): QueryDashboardDto {
    const payload = Object.assign({}, query[0], query[1]);
    const result = dashboardQuerySchema.safeParse(payload);

    if (!result.success) {
      const message = result.error.issues[0].message;
      throw new HttpError(400, "INVALID_QUERY_PARAMS", message);
    }

    return result.data;
  }
}
