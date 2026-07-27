-- AlterTable
ALTER TABLE "Employer" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactFirstName" TEXT,
ADD COLUMN     "contactLastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "plz" TEXT,
ADD COLUMN     "street" TEXT;
