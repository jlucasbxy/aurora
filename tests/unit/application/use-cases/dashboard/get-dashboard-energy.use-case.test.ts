import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InvoiceRepository } from "@/application/interfaces/repositories";
import { GetDashboardEnergyUseCase } from "@/application/use-cases/dashboard/get-dashboard-energy.use-case";
import { ResourceNotFoundError } from "@/domain/errors";
import { Quantity } from "@/domain/value-objects";

const mockRepo: InvoiceRepository = {
  save: vi.fn(),
  findAll: vi.fn(),
  aggregateEnergy: vi.fn(),
  aggregateFinancial: vi.fn()
};

describe("GetDashboardEnergyUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns mapped DTO when read model is present", async () => {
    vi.mocked(mockRepo.aggregateEnergy).mockResolvedValue({
      electricEnergyConsumption: Quantity.create(300),
      compensatedEnergy: Quantity.create(150)
    });

    const useCase = new GetDashboardEnergyUseCase(mockRepo);
    const result = await useCase.execute({
      clientNumber: "7202788900",
      dateStart: "JAN/2024",
      dateEnd: "MAR/2024"
    });

    expect(result).toEqual({
      electricEnergyConsumption: 300,
      compensatedEnergy: 150
    });
  });

  it("passes DashboardQuery built from DTO to repository.aggregateEnergy", async () => {
    vi.mocked(mockRepo.aggregateEnergy).mockResolvedValue({
      electricEnergyConsumption: Quantity.create(10),
      compensatedEnergy: Quantity.create(5)
    });

    const useCase = new GetDashboardEnergyUseCase(mockRepo);
    await useCase.execute({
      clientNumber: "7202788900",
      dateStart: "JAN/2024",
      dateEnd: "FEV/2024"
    });

    const queryArg = vi.mocked(mockRepo.aggregateEnergy).mock.calls[0]?.[0];
    expect(queryArg?.clientNumber).toBe("7202788900");
    expect(queryArg?.dateStart?.toISOString()).toBe(
      new Date(Date.UTC(2024, 0, 1)).toISOString()
    );
    expect(queryArg?.dateEnd?.toISOString()).toBe(
      new Date(Date.UTC(2024, 1, 1)).toISOString()
    );
  });

  it("throws ResourceNotFoundError when no data is found", async () => {
    vi.mocked(mockRepo.aggregateEnergy).mockResolvedValue(null);

    const useCase = new GetDashboardEnergyUseCase(mockRepo);
    await expect(
      useCase.execute({ clientNumber: "7202788900" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
