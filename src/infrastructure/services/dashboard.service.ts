import type {
  DashboardEnergyDto,
  DashboardFinancialDto,
  QueryDashboardDto
} from "@/application/dtos";
import type { DashboardService } from "@/application/interfaces/services";
import type {
  GetDashboardEnergyUseCase,
  GetDashboardFinancialUseCase
} from "@/application/use-cases/dashboard";

export class DashboardServiceImpl implements DashboardService {
  constructor(
    private readonly getDashboardEnergyUseCase: GetDashboardEnergyUseCase,
    private readonly getDashboardFinancialUseCase: GetDashboardFinancialUseCase
  ) {}

  getEnergy(dto: QueryDashboardDto): Promise<DashboardEnergyDto> {
    return this.getDashboardEnergyUseCase.execute(dto);
  }

  getFinancial(dto: QueryDashboardDto): Promise<DashboardFinancialDto> {
    return this.getDashboardFinancialUseCase.execute(dto);
  }
}
