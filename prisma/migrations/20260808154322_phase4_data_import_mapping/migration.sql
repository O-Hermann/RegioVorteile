-- AlterTable
ALTER TABLE "DataImport" ADD COLUMN     "mappedColumnCount" INTEGER,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedByUserId" TEXT,
ADD COLUMN     "processedRowCount" INTEGER;

-- CreateTable
CREATE TABLE "DataImportMapping" (
    "id" TEXT NOT NULL,
    "dataImportId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "columns" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataImportMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataImportMappingTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" "DataImportCategory" NOT NULL,
    "sourceSystem" TEXT,
    "columnSignature" TEXT NOT NULL,
    "columns" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataImportMappingTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataImportRecord" (
    "id" TEXT NOT NULL,
    "dataImportId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "referenceNumber" TEXT,
    "primaryDate" TIMESTAMP(3),
    "name" TEXT,
    "organization" TEXT,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "bookingDate" TIMESTAMP(3),
    "status" TEXT,
    "statusRaw" TEXT,
    "netAmount" DECIMAL(14,2),
    "taxAmount" DECIMAL(14,2),
    "grossAmount" DECIMAL(14,2),
    "costAmount" DECIMAL(14,2),
    "openAmount" DECIMAL(14,2),
    "amount" DECIMAL(14,2),
    "accountNumber" TEXT,
    "accountLabel" TEXT,
    "metricLabel" TEXT,
    "responsible" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataImportRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataImportMapping_dataImportId_key" ON "DataImportMapping"("dataImportId");

-- CreateIndex
CREATE INDEX "DataImportMapping_companyId_idx" ON "DataImportMapping"("companyId");

-- CreateIndex
CREATE INDEX "DataImportMappingTemplate_companyId_idx" ON "DataImportMappingTemplate"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DataImportMappingTemplate_companyId_category_columnSignatur_key" ON "DataImportMappingTemplate"("companyId", "category", "columnSignature");

-- CreateIndex
CREATE INDEX "DataImportRecord_dataImportId_idx" ON "DataImportRecord"("dataImportId");

-- CreateIndex
CREATE INDEX "DataImportRecord_companyId_idx" ON "DataImportRecord"("companyId");

-- AddForeignKey
ALTER TABLE "DataImport" ADD CONSTRAINT "DataImport_processedByUserId_fkey" FOREIGN KEY ("processedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImportMapping" ADD CONSTRAINT "DataImportMapping_dataImportId_fkey" FOREIGN KEY ("dataImportId") REFERENCES "DataImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImportMapping" ADD CONSTRAINT "DataImportMapping_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImportMappingTemplate" ADD CONSTRAINT "DataImportMappingTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImportRecord" ADD CONSTRAINT "DataImportRecord_dataImportId_fkey" FOREIGN KEY ("dataImportId") REFERENCES "DataImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImportRecord" ADD CONSTRAINT "DataImportRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
