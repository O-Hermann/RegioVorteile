-- AlterEnum
ALTER TYPE "CaseStatus" ADD VALUE 'FALSE_POSITIVE';

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "sourceRecordIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
