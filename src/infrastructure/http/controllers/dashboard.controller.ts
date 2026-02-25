import type { FastifyReply, FastifyRequest } from "fastify";
import type { DashboardService } from "@/application/interfaces/services";
import { DashboardQueryParser } from "@/infrastructure/http/parsers";

export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly queryParser: DashboardQueryParser = new DashboardQueryParser()
  ) {}

  async energy(request: FastifyRequest, reply: FastifyReply) {
    const dashboardQuery = this.queryParser.parse(request.query);
    const result = await this.dashboardService.getEnergy(dashboardQuery);
    return reply.status(200).send(result);
  }

  async financial(request: FastifyRequest, reply: FastifyReply) {
    const dashboardQuery = this.queryParser.parse(request.query);
    const result = await this.dashboardService.getFinancial(dashboardQuery);
    return reply.status(200).send(result);
  }
}
