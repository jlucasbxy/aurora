import { describe, it, expect } from "vitest";
import { ProcessInvoiceDataUseCase } from "@/application/use-cases/invoices/process-invoice-data.use-case";
import type { InvoiceExtractionDto } from "@/application/dtos";

const makeBaseInput = (overrides: Partial<InvoiceExtractionDto> = {}): InvoiceExtractionDto => ({
  clientNumber: "7202788900",
  referenceMonth: "JAN/2024",
  electricEnergyQty: 100,
  electricEnergyValue: 50.0,
  sceeEnergyQty: 200,
  sceeEnergyValue: 25.0,
  compensatedEnergyQty: 150,
  compensatedEnergyValue: -20.0,
  publicLightingContrib: 10.0,
  ...overrides
});

describe("ProcessInvoiceDataUseCase", () => {
  const useCase = new ProcessInvoiceDataUseCase();

  describe("electricEnergyConsumption", () => {
    it("sums electricEnergyQty and sceeEnergyQty", () => {
      const result = useCase.execute(makeBaseInput({ electricEnergyQty: 100, sceeEnergyQty: 200 }));
      expect(result.electricEnergyConsumption).toBe(300);
    });

    it("rounds floating-point sum", () => {
      const result = useCase.execute(makeBaseInput({ electricEnergyQty: 100.4, sceeEnergyQty: 200.7 }));
      expect(result.electricEnergyConsumption).toBe(Math.round(100.4 + 200.7));
    });
  });

  describe("compensatedEnergy", () => {
    it("equals Math.round of compensatedEnergyQty", () => {
      const result = useCase.execute(makeBaseInput({ compensatedEnergyQty: 150 }));
      expect(result.compensatedEnergy).toBe(150);
    });

    it("rounds floating-point compensatedEnergyQty", () => {
      const result = useCase.execute(makeBaseInput({ compensatedEnergyQty: 149.6 }));
      expect(result.compensatedEnergy).toBe(150);
    });
  });

  describe("totalValueWithoutGD", () => {
    it("sums electricEnergyValue, sceeEnergyValue, and publicLightingContrib", () => {
      const result = useCase.execute(makeBaseInput({
        electricEnergyValue: 50.0,
        sceeEnergyValue: 25.0,
        publicLightingContrib: 10.0
      }));
      expect(result.totalValueWithoutGD).toBe(85.0);
    });
  });

  describe("gdSavings", () => {
    it("passes compensatedEnergyValue through unchanged", () => {
      const result = useCase.execute(makeBaseInput({ compensatedEnergyValue: -20.0 }));
      expect(result.gdSavings).toBe(-20.0);
    });

    it("handles positive compensatedEnergyValue", () => {
      const result = useCase.execute(makeBaseInput({ compensatedEnergyValue: 30.5 }));
      expect(result.gdSavings).toBe(30.5);
    });
  });

  describe("raw fields passed through unchanged", () => {
    it("preserves clientNumber", () => {
      const result = useCase.execute(makeBaseInput({ clientNumber: "1234567890" }));
      expect(result.clientNumber).toBe("1234567890");
    });

    it("preserves referenceMonth", () => {
      const result = useCase.execute(makeBaseInput({ referenceMonth: "MAR/2024" }));
      expect(result.referenceMonth).toBe("MAR/2024");
    });

    it("preserves electricEnergyValue", () => {
      const result = useCase.execute(makeBaseInput({ electricEnergyValue: 99.99 }));
      expect(result.electricEnergyValue).toBe(99.99);
    });

    it("preserves publicLightingContrib", () => {
      const result = useCase.execute(makeBaseInput({ publicLightingContrib: 7.5 }));
      expect(result.publicLightingContrib).toBe(7.5);
    });
  });
});
