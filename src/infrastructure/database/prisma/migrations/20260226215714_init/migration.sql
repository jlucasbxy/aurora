-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "clientNumber" TEXT NOT NULL,
    "referenceMonth" DATE NOT NULL,
    "electricEnergyQty" INTEGER NOT NULL,
    "electricEnergyValue" DECIMAL(15,2) NOT NULL,
    "sceeEnergyQty" INTEGER NOT NULL,
    "sceeEnergyValue" DECIMAL(15,2) NOT NULL,
    "compensatedEnergyQty" INTEGER NOT NULL,
    "compensatedEnergyValue" DECIMAL(15,2) NOT NULL,
    "publicLightingContrib" DECIMAL(15,2) NOT NULL,
    "electricEnergyConsumption" INTEGER NOT NULL,
    "compensatedEnergy" INTEGER NOT NULL,
    "totalValueWithoutGD" DECIMAL(15,2) NOT NULL,
    "gdSavings" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Invoice_clientNumber_idx" ON "Invoice"("clientNumber");

-- CreateIndex
CREATE INDEX "Invoice_clientNumber_referenceMonth_idx" ON "Invoice"("clientNumber", "referenceMonth");
