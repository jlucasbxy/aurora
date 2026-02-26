import type { Redis } from "ioredis";
import type { InvoiceDto } from "@/application/dtos";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { InvoiceMapper } from "@/application/mappers";
import type {
  InvoiceEnergyReadModel,
  InvoiceFinancialReadModel
} from "@/application/read-models";
import { Invoice } from "@/domain/entities/invoice.entity";
import type { DashboardQuery, InvoicesQuery } from "@/domain/value-objects";
import { PrismaInvoiceMapper } from "@/infrastructure/database/mappers";

const CACHE_TTL_SECONDS = 300;

function buildCacheKey(query: InvoicesQuery): string {
  const clientNumber = query.clientNumber ?? "all";
  const referenceMonth = query.referenceMonth?.toISOString() ?? "all";
  const cursor = query.cursor ?? "start";
  return `invoices:list:${clientNumber}:${referenceMonth}:${cursor}:${query.limit}`;
}

async function invalidateClientCache(
  redis: Redis,
  clientNumber: string
): Promise<void> {
  const pattern = `invoices:list:${clientNumber}:*`;
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
    const key = buildCacheKey(query);

    const cached = await this.redis.get(key);
    if (cached) {
      const dtos: InvoiceDto[] = JSON.parse(cached);
      return dtos.map((dto) => PrismaInvoiceMapper.toDomain(dto));
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

  aggregateEnergy(
    query: DashboardQuery
  ): Promise<InvoiceEnergyReadModel | null> {
    return this.inner.aggregateEnergy(query);
  }

  aggregateFinancial(
    query: DashboardQuery
  ): Promise<InvoiceFinancialReadModel | null> {
    return this.inner.aggregateFinancial(query);
  }
}
