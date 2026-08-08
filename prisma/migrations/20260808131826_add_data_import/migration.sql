-- CreateEnum
CREATE TYPE "DataImportCategory" AS ENUM ('FINANCE', 'ORDERS', 'CUSTOMERS');

-- CreateEnum
CREATE TYPE "DataImportStatus" AS ENUM ('READY_FOR_MAPPING', 'VALIDATION_FAILED', 'READY_FOR_PROCESSING', 'PROCESSED', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "DataImport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "category" "DataImportCategory" NOT NULL,
    "sourceSystem" TEXT,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileContent" BYTEA NOT NULL,
    "selectedSheetName" TEXT,
    "sheetNames" TEXT[],
    "checksumSha256" TEXT NOT NULL,
    "rowCount" INTEGER,
    "columnCount" INTEGER,
    "status" "DataImportStatus" NOT NULL DEFAULT 'READY_FOR_MAPPING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataImport_companyId_idx" ON "DataImport"("companyId");

-- CreateIndex
CREATE INDEX "DataImport_companyId_checksumSha256_idx" ON "DataImport"("companyId", "checksumSha256");

-- AddForeignKey
ALTER TABLE "DataImport" ADD CONSTRAINT "DataImport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImport" ADD CONSTRAINT "DataImport_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
