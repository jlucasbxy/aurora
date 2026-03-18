import { describe, expect, it } from "vitest";
import type { InvoiceModel } from "@/infrastructure/database/prisma/generated/prisma/models/Invoice";
import { Decimal } from "@/infrastructure/database/prisma/generated/prisma/internal/prismaNamespace";
import { PrismaInvoiceMapper } from "@/infrastructure/database/mappers/prisma-invoice.mapper";

describe("PrismaInvoiceMapper", () => {
  it("maps a prisma InvoiceModel row to a domain Invoice", () => {
    const row = {
      id: "inv_123",
      clientNumber: "7202788900",
      referenceMonth: new Date(Date.UTC(2024, 0, 1)),
      electricEnergyQty: 100,
      electricEnergyValue: new Decimal(50),
      sceeEnergyQty: 200,
      sceeEnergyValue: new Decimal(25),
      compensatedEnergyQty: 150,
      compensatedEnergyValue: new Decimal(-20),
      publicLightingContrib: new Decimal(10),
      electricEnergyConsumption: 300,
      compensatedEnergy: 150,
      totalValueWithoutGD: new Decimal(85),
      gdSavings: new Decimal(-20),
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
    expect(invoice.electricEnergyValue.getValue()).toBe(row.electricEnergyValue.toNumber());
    expect(invoice.sceeEnergyQty.getValue()).toBe(row.sceeEnergyQty);
    expect(invoice.sceeEnergyValue.getValue()).toBe(row.sceeEnergyValue.toNumber());
    expect(invoice.compensatedEnergyQty.getValue()).toBe(row.compensatedEnergyQty);
    expect(invoice.compensatedEnergyValue.getValue()).toBe(
      row.compensatedEnergyValue.toNumber()
    );
    expect(invoice.publicLightingContrib.getValue()).toBe(
      row.publicLightingContrib.toNumber()
    );
    expect(invoice.electricEnergyConsumption.getValue()).toBe(
      row.electricEnergyConsumption
    );
    expect(invoice.compensatedEnergy.getValue()).toBe(row.compensatedEnergy);
    expect(invoice.totalValueWithoutGD.getValue()).toBe(row.totalValueWithoutGD.toNumber());
    expect(invoice.gdSavings.getValue()).toBe(row.gdSavings.toNumber());
  });
});
