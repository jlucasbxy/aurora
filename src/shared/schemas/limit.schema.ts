import { z } from "zod";

export const limitSchema = z.coerce
  .number()
  .int("Limit must be an integer")
  .min(1, "Limit must be at least 1")
  .max(100, "Limit must be at most 100");
