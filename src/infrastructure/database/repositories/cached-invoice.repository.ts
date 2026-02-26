import type { Redis } from "ioredis";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import type { InvoiceEnergyReadModel, InvoiceFinancialReadModel } from "@/application/read-models";
import { Invoice } from "@/domain/entities/invoice.entity";
import type { DashboardQuery, InvoicesQuery } from "@/domain/value-objects";
import { ClientNumber, Money, Quantity, ReferenceMonth } from "@/domain/value-objects";

interface CachedInvoiceRow {
  id: string;
  createdAt: string;
  clientNumber: string;
  referenceMonth: string;
  electricEnergyQty: number;
  electricEnergyValue: number;
  sceeEnergyQty: number;
  sceeEnergyValue: number;
  compensatedEnergyQty: number;
  compensatedEnergyValue: number;
  publicLightingContrib: number;
  electricEnergyConsumption: number;
  compensatedEnergy: number;
  totalValueWithoutGD: number;
  gdSavings: number;
}

const CACHE_TTL_SECONDS = 300;

function buildCacheKey(query: InvoicesQuery): string {
  const clientNumber = query.clientNumber ?? "all";
  const referenceMonth = query.referenceMonth?.toISOString() ?? "all";
  const cursor = query.cursor ?? "start";
  return `invoices:list:${clientNumber}:${referenceMonth}:${cursor}:${query.limit}`;
}

function serialize(invoice: Invoice): CachedInvoiceRow {
  return {
    id: invoice.id,
    createdAt: invoice.createdAt.toISOString(),
    clientNumber: invoice.clientNumber.getValue(),
    referenceMonth: invoice.referenceMonth.getValue().toISOString(),
    electricEnergyQty: invoice.electricEnergyQty.getValue(),
    electricEnergyValue: invoice.electricEnergyValue.getValue(),
    sceeEnergyQty: invoice.sceeEnergyQty.getValue(),
    sceeEnergyValue: invoice.sceeEnergyValue.getValue(),
    compensatedEnergyQty: invoice.compensatedEnergyQty.getValue(),
    compensatedEnergyValue: invoice.compensatedEnergyValue.getValue(),
    publicLightingContrib: invoice.publicLightingContrib.getValue(),
    electricEnergyConsumption: invoice.electricEnergyConsumption.getValue(),
    compensatedEnergy: invoice.compensatedEnergy.getValue(),
    totalValueWithoutGD: invoice.totalValueWithoutGD.getValue(),
    gdSavings: invoice.gdSavings.getValue()
  };
}

function deserialize(row: CachedInvoiceRow): Invoice {
  return Invoice.reconstitute(row.id, new Date(row.createdAt), {
    clientNumber: ClientNumber.reconstitute(row.clientNumber),
    referenceMonth: ReferenceMonth.reconstitute(new Date(row.referenceMonth)),
    electricEnergyQty: Quantity.reconstitute(row.electricEnergyQty),
    electricEnergyValue: Money.reconstitute(row.electricEnergyValue),
    sceeEnergyQty: Quantity.reconstitute(row.sceeEnergyQty),
    sceeEnergyValue: Money.reconstitute(row.sceeEnergyValue),
    compensatedEnergyQty: Quantity.reconstitute(row.compensatedEnergyQty),
    compensatedEnergyValue: Money.reconstitute(row.compensatedEnergyValue),
    publicLightingContrib: Money.reconstitute(row.publicLightingContrib),
    electricEnergyConsumption: Quantity.reconstitute(row.electricEnergyConsumption),
    compensatedEnergy: Quantity.reconstitute(row.compensatedEnergy),
    totalValueWithoutGD: Money.reconstitute(row.totalValueWithoutGD),
    gdSavings: Money.reconstitute(row.gdSavings)
  });
}

async function invalidateClientCache(redis: Redis, clientNumber: string): Promise<void> {
  const pattern = `invoices:list:${clientNumber}:*`;
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.unlink(...keys);
    }
  } while (cursor !== "0");
}

export class CachedInvoiceRepository implements InvoiceRepository {
  constructor(
    private readonly inner: InvoiceRepository,
    private readonly redis: Redis
  ) {}

  async findAll(query: InvoicesQuery): Promise<Invoice[]> {
    const key = buildCacheKey(query);

    const cached = await this.redis.get(key);
    if (cached) {
      const rows: CachedInvoiceRow[] = JSON.parse(cached);
      return rows.map(deserialize);
    }

    const invoices = await this.inner.findAll(query);
    await this.redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(invoices.map(serialize)));
    return invoices;
  }

  async save(invoice: Invoice): Promise<Invoice> {
    const saved = await this.inner.save(invoice);
    await invalidateClientCache(this.redis, saved.clientNumber.getValue());
    return saved;
  }

  aggregateEnergy(query: DashboardQuery): Promise<InvoiceEnergyReadModel | null> {
    return this.inner.aggregateEnergy(query);
  }

  aggregateFinancial(query: DashboardQuery): Promise<InvoiceFinancialReadModel | null> {
    return this.inner.aggregateFinancial(query);
  }
}
