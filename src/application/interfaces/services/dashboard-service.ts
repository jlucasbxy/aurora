import type {
  DashboardEnergyDto,
  DashboardFinancialDto,
  QueryDashboardDto
} from "@/application/dtos";

export interface DashboardService {
  getEnergy(dto: QueryDashboardDto): Promise<DashboardEnergyDto>;
  getFinancial(dto: QueryDashboardDto): Promise<DashboardFinancialDto>;
}
