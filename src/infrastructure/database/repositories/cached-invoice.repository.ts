import type { Redis } from "ioredis";
import { z } from "zod";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { InvoiceMapper } from "@/application/mappers";
import type {
  InvoiceEnergyReadModel,
  InvoiceFinancialReadModel
} from "@/application/read-models";
import type { Invoice } from "@/domain/entities/invoice.entity";
import type { DashboardQuery, InvoicesQuery } from "@/domain/value-objects";
import { Money, Quantity } from "@/domain/value-objects";

const CACHE_TTL_SECONDS = 300;

const invoiceDtoSchema = z.object({
  id: z.string(),
  clientNumber: z.string(),
  referenceMonth: z.string(),
  electricEnergyQty: z.number(),
  electricEnergyValue: z.number(),
  sceeEnergyQty: z.number(),
  sceeEnergyValue: z.number(),
  compensatedEnergyQty: z.number(),
  compensatedEnergyValue: z.number(),
  publicLightingContrib: z.number(),
  electricEnergyConsumption: z.number(),
  compensatedEnergy: z.number(),
  totalValueWithoutGD: z.number(),
  gdSavings: z.number(),
  createdAt: z.string()
});
const invoiceDtoArraySchema = z.array(invoiceDtoSchema);

const energyCacheSchema = z.object({
  electricEnergyConsumption: z.number(),
  compensatedEnergy: z.number()
});

const financialCacheSchema = z.object({
  totalValueWithoutGD: z.number(),
  gdSavings: z.number()
});

function buildListCacheKey(query: InvoicesQuery): string {
  const clientNumber = query.clientNumber ?? "all";
  const referenceMonth = query.referenceMonth?.toISOString() ?? "all";
  const cursor = query.cursor ?? "start";
  return `invoices:${clientNumber}:list:${referenceMonth}:${cursor}:${query.limit}`;
}

function buildDashboardCacheKey(
  type: "energy" | "financial",
  query: DashboardQuery
): string {
  const dateStart = query.dateStart?.toISOString() ?? "all";
  const dateEnd = query.dateEnd?.toISOString() ?? "all";
  return `invoices:${query.clientNumber}:dashboard:${type}:${dateStart}:${dateEnd}`;
}

async function invalidateClientCache(
  redis: Redis,
  clientNumber: string
): Promise<void> {
  const pattern = `invoices:${clientNumber}:*`;
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100
    );
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
    const key = buildListCacheKey(query);

    const cached = await this.redis.get(key);
    if (cached) {
      const parsed = invoiceDtoArraySchema.safeParse(JSON.parse(cached));
      if (parsed.success) {
        return parsed.data.map(InvoiceMapper.fromDto);
      }
    }

    const invoices = await this.inner.findAll(query);
    await this.redis.setex(
      key,
      CACHE_TTL_SECONDS,
      JSON.stringify(invoices.map(InvoiceMapper.toDto))
    );
    return invoices;
  }

  async save(invoice: Invoice): Promise<Invoice> {
    const saved = await this.inner.save(invoice);
    await invalidateClientCache(this.redis, saved.clientNumber.getValue());
    return saved;
  }

  async aggregateEnergy(
    query: DashboardQuery
  ): Promise<InvoiceEnergyReadModel | null> {
    const key = buildDashboardCacheKey("energy", query);

    const cached = await this.redis.get(key);
    if (cached) {
      const parsed = energyCacheSchema.safeParse(JSON.parse(cached));
      if (parsed.success) {
        return {
          electricEnergyConsumption: Quantity.reconstitute(
            parsed.data.electricEnergyConsumption
          ),
          compensatedEnergy: Quantity.reconstitute(
            parsed.data.compensatedEnergy
          )
        };
      }
    }

    const result = await this.inner.aggregateEnergy(query);
    if (result) {
      await this.redis.setex(
        key,
        CACHE_TTL_SECONDS,
        JSON.stringify({
          electricEnergyConsumption:
            result.electricEnergyConsumption.getValue(),
          compensatedEnergy: result.compensatedEnergy.getValue()
        })
      );
    }
    return result;
  }

  async aggregateFinancial(
    query: DashboardQuery
  ): Promise<InvoiceFinancialReadModel | null> {
    const key = buildDashboardCacheKey("financial", query);

    const cached = await this.redis.get(key);
    if (cached) {
      const parsed = financialCacheSchema.safeParse(JSON.parse(cached));
      if (parsed.success) {
        return {
          totalValueWithoutGD: Money.reconstitute(
            parsed.data.totalValueWithoutGD
          ),
          gdSavings: Money.reconstitute(parsed.data.gdSavings)
        };
      }
    }

    const result = await this.inner.aggregateFinancial(query);
    if (result) {
      await this.redis.setex(
        key,
        CACHE_TTL_SECONDS,
        JSON.stringify({
          totalValueWithoutGD: result.totalValueWithoutGD.getValue(),
          gdSavings: result.gdSavings.getValue()
        })
      );
    }
    return result;
  }
}
