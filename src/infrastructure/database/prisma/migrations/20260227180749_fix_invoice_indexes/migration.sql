-- DropIndex
DROP INDEX "Invoice_clientNumber_idx";

-- CreateIndex
CREATE INDEX "Invoice_referenceMonth_idx" ON "Invoice"("referenceMonth");
