import { describe, expect, it } from "vitest";
import type { InvoiceExtractionDto } from "@/application/dtos";
import { ProcessInvoiceDataUseCase } from "@/application/use-cases/invoices/process-invoice-data.use-case";

const makeBaseInput = (
  overrides: Partial<InvoiceExtractionDto> = {}
): InvoiceExtractionDto => ({
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
      const result = useCase.execute(
        makeBaseInput({ electricEnergyQty: 100, sceeEnergyQty: 200 })
      );
      expect(result.electricEnergyConsumption).toBe(300);
    });

    it("rounds floating-point sum", () => {
      const result = useCase.execute(
        makeBaseInput({ electricEnergyQty: 100.4, sceeEnergyQty: 200.7 })
      );
      expect(result.electricEnergyConsumption).toBe(Math.round(100.4 + 200.7));
    });
  });

  describe("compensatedEnergy", () => {
    it("equals Math.round of compensatedEnergyQty", () => {
      const result = useCase.execute(
        makeBaseInput({ compensatedEnergyQty: 150 })
      );
      expect(result.compensatedEnergy).toBe(150);
    });

    it("rounds floating-point compensatedEnergyQty", () => {
      const result = useCase.execute(
        makeBaseInput({ compensatedEnergyQty: 149.6 })
      );
      expect(result.compensatedEnergy).toBe(150);
    });
  });

  describe("totalValueWithoutGD", () => {
    it("sums electricEnergyValue, sceeEnergyValue, and publicLightingContrib", () => {
      const result = useCase.execute(
        makeBaseInput({
          electricEnergyValue: 50.0,
          sceeEnergyValue: 25.0,
          publicLightingContrib: 10.0
        })
      );
      expect(result.totalValueWithoutGD).toBe(85.0);
    });
  });

  describe("gdSavings", () => {
    it("passes compensatedEnergyValue through unchanged", () => {
      const result = useCase.execute(
        makeBaseInput({ compensatedEnergyValue: -20.0 })
      );
      expect(result.gdSavings).toBe(-20.0);
    });

    it("handles positive compensatedEnergyValue", () => {
      const result = useCase.execute(
        makeBaseInput({ compensatedEnergyValue: 30.5 })
      );
      expect(result.gdSavings).toBe(30.5);
    });
  });

  describe("floating-point precision", () => {
    it("totalValueWithoutGD: 0.1 + 0.2 + 0.3 equals 0.6 exactly, not 0.6000000000000001", () => {
      const result = useCase.execute(
        makeBaseInput({
          electricEnergyValue: 0.1,
          sceeEnergyValue: 0.2,
          publicLightingContrib: 0.3
        })
      );
      expect(result.totalValueWithoutGD).toBe(0.6);
      // Native JS: 0.1 + 0.2 + 0.3 === 0.6000000000000001
      expect(0.1 + 0.2 + 0.3).not.toBe(0.6);
    });

    it("totalValueWithoutGD: 1.1 + 2.2 + 3.3 equals 6.6 exactly", () => {
      // 1.1 + 2.2 = 3.3000000000000003 in native JS; chaining with Decimal avoids accumulation
      const result = useCase.execute(
        makeBaseInput({
          electricEnergyValue: 1.1,
          sceeEnergyValue: 2.2,
          publicLightingContrib: 3.3
        })
      );
      expect(result.totalValueWithoutGD).toBe(6.6);
    });

    it("totalValueWithoutGD: 1.1 + 2.2 accumulates float error in native JS", () => {
      // Demonstrates why Decimal.js is needed for multi-step sums
      expect(1.1 + 2.2).not.toBe(3.3);
    });

    it("electricEnergyConsumption: 0.1 + 0.2 rounds to 0", () => {
      // 0.1 + 0.2 = 0.30000000000000004 in native JS; Decimal gives exact 0.3, both round to 0
      const result = useCase.execute(
        makeBaseInput({
          electricEnergyQty: 0.1,
          sceeEnergyQty: 0.2
        })
      );
      expect(result.electricEnergyConsumption).toBe(0);
    });

    it("electricEnergyConsumption: 100.3 + 200.2 rounds to 301 (exact 300.5 rounds up)", () => {
      const result = useCase.execute(
        makeBaseInput({
          electricEnergyQty: 100.3,
          sceeEnergyQty: 200.2
        })
      );
      expect(result.electricEnergyConsumption).toBe(301);
    });

    it("electricEnergyConsumption: 0.3 + 149.2 rounds to 150 (exact 149.5 rounds up)", () => {
      const result = useCase.execute(
        makeBaseInput({
          electricEnergyQty: 0.3,
          sceeEnergyQty: 149.2
        })
      );
      expect(result.electricEnergyConsumption).toBe(150);
    });
  });

  describe("raw fields passed through unchanged", () => {
    it("preserves clientNumber", () => {
      const result = useCase.execute(
        makeBaseInput({ clientNumber: "1234567890" })
      );
      expect(result.clientNumber).toBe("1234567890");
    });

    it("preserves referenceMonth", () => {
      const result = useCase.execute(
        makeBaseInput({ referenceMonth: "MAR/2024" })
      );
      expect(result.referenceMonth).toBe("MAR/2024");
    });

    it("preserves electricEnergyValue", () => {
      const result = useCase.execute(
        makeBaseInput({ electricEnergyValue: 99.99 })
      );
      expect(result.electricEnergyValue).toBe(99.99);
    });

    it("preserves publicLightingContrib", () => {
      const result = useCase.execute(
        makeBaseInput({ publicLightingContrib: 7.5 })
      );
      expect(result.publicLightingContrib).toBe(7.5);
    });
  });
});
