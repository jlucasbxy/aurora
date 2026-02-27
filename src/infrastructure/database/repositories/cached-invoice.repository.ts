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

async function invalidateCacheByPattern(
  redis: Redis,
  pattern: string
): Promise<void> {
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

async function invalidateClientCache(
  redis: Redis,
  clientNumber: string
): Promise<void> {
  await invalidateCacheByPattern(redis, `invoices:${clientNumber}:*`);
}

async function invalidateGlobalCache(redis: Redis): Promise<void> {
  await invalidateCacheByPattern(redis, `invoices:all:*`);
}

async function cacheThrough<TCache, TResult>(
  redis: Redis,
  key: string,
  schema: z.ZodType<TCache>,
  fromCache: (data: TCache) => TResult,
  toCache: (result: NonNullable<TResult>) => TCache,
  fetch: () => Promise<TResult>
): Promise<TResult> {
  const cached = await redis.get(key);
  if (cached) {
    try {
      const parsed = schema.safeParse(JSON.parse(cached));
      if (parsed.success) {
        return fromCache(parsed.data);
      }
    } catch {
      // malformed JSON, fall through to fetch
    }
  }

  const result = await fetch();
  if (result != null) {
    await redis.setex(
      key,
      CACHE_TTL_SECONDS,
      JSON.stringify(toCache(result as NonNullable<TResult>))
    );
  }
  return result;
}

export class CachedInvoiceRepository implements InvoiceRepository {
  constructor(
    private readonly inner: InvoiceRepository,
    private readonly redis: Redis
  ) {}

  async findAll(query: InvoicesQuery): Promise<Invoice[]> {
    return cacheThrough(
      this.redis,
      buildListCacheKey(query),
      invoiceDtoArraySchema,
      (dtos) => dtos.map(InvoiceMapper.fromDto),
      (invoices) => invoices.map(InvoiceMapper.toDto),
      () => this.inner.findAll(query)
    );
  }

  async save(invoice: Invoice): Promise<Invoice> {
    const saved = await this.inner.save(invoice);
    await Promise.all([
      invalidateClientCache(this.redis, saved.clientNumber.getValue()),
      invalidateGlobalCache(this.redis)
    ]);
    return saved;
  }

  async aggregateEnergy(
    query: DashboardQuery
  ): Promise<InvoiceEnergyReadModel | null> {
    return cacheThrough(
      this.redis,
      buildDashboardCacheKey("energy", query),
      energyCacheSchema,
      (data) => ({
        electricEnergyConsumption: Quantity.reconstitute(
          data.electricEnergyConsumption
        ),
        compensatedEnergy: Quantity.reconstitute(data.compensatedEnergy)
      }),
      (result) => ({
        electricEnergyConsumption: result.electricEnergyConsumption.getValue(),
        compensatedEnergy: result.compensatedEnergy.getValue()
      }),
      () => this.inner.aggregateEnergy(query)
    );
  }

  async aggregateFinancial(
    query: DashboardQuery
  ): Promise<InvoiceFinancialReadModel | null> {
    return cacheThrough(
      this.redis,
      buildDashboardCacheKey("financial", query),
      financialCacheSchema,
      (data) => ({
        totalValueWithoutGD: Money.reconstitute(data.totalValueWithoutGD),
        gdSavings: Money.reconstitute(data.gdSavings)
      }),
      (result) => ({
        totalValueWithoutGD: result.totalValueWithoutGD.getValue(),
        gdSavings: result.gdSavings.getValue()
      }),
      () => this.inner.aggregateFinancial(query)
    );
  }
}
