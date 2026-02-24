import type { FastifyReply, FastifyRequest } from "fastify";
import type { DashboardService } from "@/application/interfaces/services";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async energy(request: FastifyRequest, reply: FastifyReply) {
    const { clientNumber, referenceMonth } = request.query as {
      clientNumber?: string;
      referenceMonth?: string;
    };
    const result = await this.dashboardService.getEnergy({
      clientNumber,
      referenceMonth
    });
    return reply.status(200).send(result);
  }

  async financial(request: FastifyRequest, reply: FastifyReply) {
    const { clientNumber, referenceMonth } = request.query as {
      clientNumber?: string;
      referenceMonth?: string;
    };
    const result = await this.dashboardService.getFinancial({
      clientNumber,
      referenceMonth
    });
    return reply.status(200).send(result);
  }
}
