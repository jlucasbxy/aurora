import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InvoiceRepository } from "@/application/interfaces/repositories";
import { GetDashboardFinancialUseCase } from "@/application/use-cases/dashboard/get-dashboard-financial.use-case";
import { ResourceNotFoundError } from "@/domain/errors";
import { Money } from "@/domain/value-objects";

const mockRepo: InvoiceRepository = {
  save: vi.fn(),
  findAll: vi.fn(),
  aggregateEnergy: vi.fn(),
  aggregateFinancial: vi.fn()
};

describe("GetDashboardFinancialUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns mapped DTO when read model is present", async () => {
    vi.mocked(mockRepo.aggregateFinancial).mockResolvedValue({
      totalValueWithoutGD: Money.create(85.0),
      gdSavings: Money.create(-20.0)
    });

    const useCase = new GetDashboardFinancialUseCase(mockRepo);
    const result = await useCase.execute({
      clientNumber: "7202788900",
      dateStart: "JAN/2024",
      dateEnd: "MAR/2024"
    });

    expect(result).toEqual({
      totalValueWithoutGD: 85.0,
      gdSavings: -20.0
    });
  });

  it("passes DashboardQuery built from DTO to repository.aggregateFinancial", async () => {
    vi.mocked(mockRepo.aggregateFinancial).mockResolvedValue({
      totalValueWithoutGD: Money.create(10.0),
      gdSavings: Money.create(5.0)
    });

    const useCase = new GetDashboardFinancialUseCase(mockRepo);
    await useCase.execute({
      clientNumber: "7202788900",
      dateStart: "JAN/2024",
      dateEnd: "FEV/2024"
    });

    const queryArg = vi.mocked(mockRepo.aggregateFinancial).mock.calls[0]?.[0];
    expect(queryArg?.clientNumber).toBe("7202788900");
    expect(queryArg?.dateStart?.toISOString()).toBe(
      new Date(Date.UTC(2024, 0, 1)).toISOString()
    );
    expect(queryArg?.dateEnd?.toISOString()).toBe(
      new Date(Date.UTC(2024, 1, 1)).toISOString()
    );
  });

  it("throws ResourceNotFoundError when no data is found", async () => {
    vi.mocked(mockRepo.aggregateFinancial).mockResolvedValue(null);

    const useCase = new GetDashboardFinancialUseCase(mockRepo);
    await expect(
      useCase.execute({ clientNumber: "7202788900" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
