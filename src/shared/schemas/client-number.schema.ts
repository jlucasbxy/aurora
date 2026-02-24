import { z } from "zod";

export const clientNumberSchema = z
  .string()
  .regex(/^\d{10}$/, "Client number must be exactly 10 digits");
