import {
  CachedInvoiceRepository,
  PrismaInvoiceRepository
} from "@/infrastructure/database/repositories";
import { makePrismaClient } from "@/main/factories/prisma";
import { makeRedisClient } from "@/main/factories/redis";
import { singleton } from "@/main/factories/singleton.util";

export const makeInvoiceRepository = singleton(
  () =>
    new CachedInvoiceRepository(
      new PrismaInvoiceRepository(makePrismaClient()),
      makeRedisClient()
    )
);
