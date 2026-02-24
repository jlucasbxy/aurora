import { z } from "zod";

export const referenceMonthSchema = z
  .string()
  .regex(
    /^(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}$/,
    "Reference month must be in MMM/YYYY format (e.g. JAN/2024)"
  );
