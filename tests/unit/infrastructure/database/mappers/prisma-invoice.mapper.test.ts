import { describe, expect, it } from "vitest";
import type { InvoiceModel } from "@/infrastructure/database/prisma/generated/prisma/models/Invoice";
import { PrismaInvoiceMapper } from "@/infrastructure/database/mappers/prisma-invoice.mapper";

describe("PrismaInvoiceMapper", () => {
  it("maps a prisma InvoiceModel row to a domain Invoice", () => {
    const row = {
      id: "inv_123",
      clientNumber: "7202788900",
      referenceMonth: new Date(Date.UTC(2024, 0, 1)),
      electricEnergyQty: 100,
      electricEnergyValue: 50,
      sceeEnergyQty: 200,
      sceeEnergyValue: 25,
      compensatedEnergyQty: 150,
      compensatedEnergyValue: -20,
      publicLightingContrib: 10,
      electricEnergyConsumption: 300,
      compensatedEnergy: 150,
      totalValueWithoutGD: 85,
      gdSavings: -20,
      createdAt: new Date("2024-01-02T00:00:00.000Z")
    } satisfies Partial<InvoiceModel>;

    const invoice = PrismaInvoiceMapper.toDomain(row as InvoiceModel);

    expect(invoice.id).toBe(row.id);
    expect(invoice.createdAt.toISOString()).toBe(row.createdAt?.toISOString());
    expect(invoice.clientNumber.getValue()).toBe(row.clientNumber);
    expect(invoice.referenceMonth.getValue().toISOString()).toBe(
      row.referenceMonth?.toISOString()
    );

    expect(invoice.electricEnergyQty.getValue()).toBe(row.electricEnergyQty);
    expect(invoice.electricEnergyValue.getValue()).toBe(row.electricEnergyValue);
    expect(invoice.sceeEnergyQty.getValue()).toBe(row.sceeEnergyQty);
    expect(invoice.sceeEnergyValue.getValue()).toBe(row.sceeEnergyValue);
    expect(invoice.compensatedEnergyQty.getValue()).toBe(row.compensatedEnergyQty);
    expect(invoice.compensatedEnergyValue.getValue()).toBe(
      row.compensatedEnergyValue
    );
    expect(invoice.publicLightingContrib.getValue()).toBe(row.publicLightingContrib);
    expect(invoice.electricEnergyConsumption.getValue()).toBe(
      row.electricEnergyConsumption
    );
    expect(invoice.compensatedEnergy.getValue()).toBe(row.compensatedEnergy);
    expect(invoice.totalValueWithoutGD.getValue()).toBe(row.totalValueWithoutGD);
    expect(invoice.gdSavings.getValue()).toBe(row.gdSavings);
  });
});

