import { env } from "@/infrastructure/config/env.config";

export const RATE_LIMITS = {
  INVOICE_LIST: {
    max: env.RATE_LIMIT_INVOICE_LIST_MAX,
    timeWindow: env.RATE_LIMIT_INVOICE_LIST_WINDOW
  },
  INVOICE_UPLOAD: {
    max: env.RATE_LIMIT_INVOICE_UPLOAD_MAX,
    timeWindow: env.RATE_LIMIT_INVOICE_UPLOAD_WINDOW
  },
  DASHBOARD: {
    max: env.RATE_LIMIT_DASHBOARD_MAX,
    timeWindow: env.RATE_LIMIT_DASHBOARD_WINDOW
  }
} as const;
