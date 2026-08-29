-- CreateEnum
CREATE TYPE "CaseCategory" AS ENUM ('DUPLICATE_PAYMENT', 'MISSED_DISCOUNT', 'OPEN_CREDIT_NOTE', 'OVERPAYMENT');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('NEW', 'IN_REVIEW', 'REVIEWED', 'CLOSED');

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" "CaseCategory" NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Case_companyId_idx" ON "Case"("companyId");

-- CreateIndex
CREATE INDEX "Case_companyId_status_idx" ON "Case"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Case_companyId_category_dedupeKey_key" ON "Case"("companyId", "category", "dedupeKey");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
