export const RATE_LIMITS = {
  INVOICE_LIST:   { max: 100, timeWindow: "15 minutes" },
  INVOICE_UPLOAD: { max:  20, timeWindow: "15 minutes" },
  DASHBOARD:      { max: 100, timeWindow: "15 minutes" },
} as const;
