/*
  Warnings:

  - Added the required column `city` to the `PartnerBusiness` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `PartnerBusiness` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PartnerBusiness" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountText" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "plz" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "logoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "contractEndDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartnerBusiness_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PartnerBusiness" ("active", "category", "contractEndDate", "createdAt", "description", "discountText", "id", "logoUrl", "name", "plz", "regionId") SELECT "active", "category", "contractEndDate", "createdAt", "description", "discountText", "id", "logoUrl", "name", "plz", "regionId" FROM "PartnerBusiness";
DROP TABLE "PartnerBusiness";
ALTER TABLE "new_PartnerBusiness" RENAME TO "PartnerBusiness";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
