DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Invoice"
    GROUP BY "clientNumber", "referenceMonth"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot create unique constraint on Invoice(clientNumber, referenceMonth): duplicate rows already exist. Please clean duplicates before applying this migration.';
  END IF;
END $$;

DROP INDEX IF EXISTS "Invoice_clientNumber_referenceMonth_idx";

CREATE UNIQUE INDEX "Invoice_clientNumber_referenceMonth_key"
ON "Invoice"("clientNumber", "referenceMonth");
