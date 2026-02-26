import type { FastifyReply, FastifyRequest } from "fastify";
import type { DashboardService } from "@/application/interfaces/services";
import type { QueryDashboardDto } from "@/application/dtos/query-dashboard.dto";
import type { Parser } from "@/infrastructure/http/parsers";

type DashboardParams = { clientNumber: string };

export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly queryParser: Parser<QueryDashboardDto>
  ) {}

  async energy(
    request: FastifyRequest<{ Params: DashboardParams }>,
    reply: FastifyReply
  ) {
    const dashboardQuery = this.queryParser.parse(
      request.query,
      request.params
    );
    const result = await this.dashboardService.getEnergy(dashboardQuery);
    return reply.status(200).send(result);
  }

  async financial(
    request: FastifyRequest<{ Params: DashboardParams }>,
    reply: FastifyReply
  ) {
    const dashboardQuery = this.queryParser.parse(
      request.query,
      request.params
    );
    const result = await this.dashboardService.getFinancial(dashboardQuery);
    return reply.status(200).send(result);
  }
}
