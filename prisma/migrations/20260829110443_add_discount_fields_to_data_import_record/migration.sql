-- AlterTable
ALTER TABLE "DataImportRecord" ADD COLUMN     "discountDeadline" TIMESTAMP(3),
ADD COLUMN     "discountPercent" DECIMAL(5,2);
