/*
  Warnings:

  - Added the required column `contractEndDate` to the `Employer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractEndDate` to the `PartnerBusiness` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeCount" INTEGER NOT NULL,
    "regionId" TEXT NOT NULL,
    "pricingTierId" TEXT NOT NULL,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'ausstehend',
    "contractEndDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Employer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Employer_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Employer_pricingTierId_fkey" FOREIGN KEY ("pricingTierId") REFERENCES "PricingTier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Employer" ("companyName", "createdAt", "employeeCount", "id", "pricingTierId", "regionId", "subscriptionStatus", "userId") SELECT "companyName", "createdAt", "employeeCount", "id", "pricingTierId", "regionId", "subscriptionStatus", "userId" FROM "Employer";
DROP TABLE "Employer";
ALTER TABLE "new_Employer" RENAME TO "Employer";
CREATE UNIQUE INDEX "Employer_userId_key" ON "Employer"("userId");
CREATE TABLE "new_PartnerBusiness" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountText" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "plz" TEXT NOT NULL,
    "logoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "contractEndDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartnerBusiness_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PartnerBusiness" ("active", "category", "createdAt", "description", "discountText", "id", "logoUrl", "name", "plz", "regionId") SELECT "active", "category", "createdAt", "description", "discountText", "id", "logoUrl", "name", "plz", "regionId" FROM "PartnerBusiness";
DROP TABLE "PartnerBusiness";
ALTER TABLE "new_PartnerBusiness" RENAME TO "PartnerBusiness";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
