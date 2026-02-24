// eslint-disable-next-line no-restricted-imports
import type { PrismaClient } from "./generated/prisma/client";
// eslint-disable-next-line no-restricted-imports
import type { TransactionClient } from "./generated/prisma/internal/prismaNamespace";
export type PrismaDatabase = PrismaClient | TransactionClient;
