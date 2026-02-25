import { z } from "zod";
import { HttpError } from "@/infrastructure/http/errors";
import type { QueryDashboardDto } from "@/application/dtos/query-dashboard.dto";
import type { Parser } from "@/infrastructure/http/parsers";

const dashboardQuerySchema = z.object({
  dateStart: z.string().optional(),
  dateEnd: z.string().optional()
});

export class DashboardQueryParser implements Parser<Omit<QueryDashboardDto, "clientNumber">> {
  parse(query: unknown): Omit<QueryDashboardDto, "clientNumber"> {
    const result = dashboardQuerySchema.safeParse(query);

    if (!result.success) {
      const message = result.error.issues[0].message;
      throw new HttpError(400, "INVALID_QUERY_PARAMS", message);
    }

    return result.data;
  }
}
