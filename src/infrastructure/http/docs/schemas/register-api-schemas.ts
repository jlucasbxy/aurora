import type { FastifyInstance } from "fastify";

const errorResponseSchema = {
  $id: "ErrorResponse",
  type: "object",
  required: ["code", "message"],
  properties: {
    code: { type: "string" },
    message: {
      oneOf: [
        { type: "string" },
        {
          type: "array",
          items: { type: "string" }
        }
      ]
    }
  }
} as const;

const invoiceSchema = {
  $id: "Invoice",
  type: "object",
  required: [
    "id",
    "clientNumber",
    "referenceMonth",
    "electricEnergyQty",
    "electricEnergyValue",
    "sceeEnergyQty",
    "sceeEnergyValue",
    "compensatedEnergyQty",
    "compensatedEnergyValue",
    "publicLightingContrib",
    "electricEnergyConsumption",
    "compensatedEnergy",
    "totalValueWithoutGD",
    "gdSavings",
    "createdAt"
  ],
  properties: {
    id: { type: "string" },
    clientNumber: { type: "string" },
    referenceMonth: { type: "string" },
    electricEnergyQty: { type: "number" },
    electricEnergyValue: { type: "number" },
    sceeEnergyQty: { type: "number" },
    sceeEnergyValue: { type: "number" },
    compensatedEnergyQty: { type: "number" },
    compensatedEnergyValue: { type: "number" },
    publicLightingContrib: { type: "number" },
    electricEnergyConsumption: { type: "number" },
    compensatedEnergy: { type: "number" },
    totalValueWithoutGD: { type: "number" },
    gdSavings: { type: "number" },
    createdAt: { type: "string", format: "date-time" }
  }
} as const;

const invoicePaginatedResultSchema = {
  $id: "InvoicePaginatedResult",
  type: "object",
  required: ["data", "nextCursor", "hasNextPage"],
  properties: {
    data: {
      type: "array",
      items: { $ref: "Invoice#" }
    },
    nextCursor: {
      anyOf: [{ type: "string" }, { type: "null" }]
    },
    hasNextPage: { type: "boolean" }
  }
} as const;

const dashboardEnergySchema = {
  $id: "DashboardEnergy",
  type: "object",
  required: ["electricEnergyConsumption", "compensatedEnergy"],
  properties: {
    electricEnergyConsumption: { type: "number" },
    compensatedEnergy: { type: "number" }
  }
} as const;

const dashboardFinancialSchema = {
  $id: "DashboardFinancial",
  type: "object",
  required: ["totalValueWithoutGD", "gdSavings"],
  properties: {
    totalValueWithoutGD: { type: "number" },
    gdSavings: { type: "number" }
  }
} as const;

export function registerApiSchemas(app: FastifyInstance) {
  const schemas = [
    errorResponseSchema,
    invoiceSchema,
    invoicePaginatedResultSchema,
    dashboardEnergySchema,
    dashboardFinancialSchema
  ];

  for (const schema of schemas) {
    app.addSchema(schema);
  }
}
