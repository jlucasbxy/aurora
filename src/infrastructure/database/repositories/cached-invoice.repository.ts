import { z } from "zod";
import type { CacheProvider } from "@/application/interfaces/providers";
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
const CACHE_KEY_PREFIX = "cache:";
const INVOICES_ALL_TAG = "invoices:all";

function buildClientTag(clientNumber: string): string {
  return `invoices:client:${clientNumber}`;
}

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

function toCacheStorageKey(baseKey: string): string {
  return `${CACHE_KEY_PREFIX}${baseKey}`;
}

async function cacheThrough<TCache, TResult>(
  cache: CacheProvider,
  baseKey: string,
  tags: string[],
  schema: z.ZodType<TCache>,
  fromCache: (data: TCache) => TResult,
  toCache: (result: NonNullable<TResult>) => TCache,
  fetch: () => Promise<TResult>
): Promise<TResult> {
  const key = toCacheStorageKey(baseKey);
  const cached = await cache.get(key);
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
    await Promise.all([
      cache.set(
        key,
        JSON.stringify(toCache(result as NonNullable<TResult>)),
        CACHE_TTL_SECONDS
      ),
      cache.addTags(key, tags, CACHE_TTL_SECONDS)
    ]);
  }
  return result;
}

export class CachedInvoiceRepository implements InvoiceRepository {
  constructor(
    private readonly inner: InvoiceRepository,
    private readonly cache: CacheProvider
  ) {}

  async findAll(query: InvoicesQuery): Promise<Invoice[]> {
    const tags = query.clientNumber
      ? [buildClientTag(query.clientNumber)]
      : [INVOICES_ALL_TAG];

    return cacheThrough(
      this.cache,
      buildListCacheKey(query),
      tags,
      invoiceDtoArraySchema,
      (dtos) => dtos.map(InvoiceMapper.fromDto),
      (invoices) => invoices.map(InvoiceMapper.toDto),
      () => this.inner.findAll(query)
    );
  }

  async save(invoice: Invoice): Promise<Invoice> {
    const saved = await this.inner.save(invoice);
    await Promise.all([
      this.cache.deleteByTag(buildClientTag(saved.clientNumber.getValue())),
      this.cache.deleteByTag(INVOICES_ALL_TAG)
    ]);
    return saved;
  }

  async aggregateEnergy(
    query: DashboardQuery
  ): Promise<InvoiceEnergyReadModel | null> {
    const tags = [buildClientTag(query.clientNumber)];

    return cacheThrough(
      this.cache,
      buildDashboardCacheKey("energy", query),
      tags,
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
    const tags = [buildClientTag(query.clientNumber)];

    return cacheThrough(
      this.cache,
      buildDashboardCacheKey("financial", query),
      tags,
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
