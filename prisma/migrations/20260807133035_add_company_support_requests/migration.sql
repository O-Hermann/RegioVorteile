-- AlterEnum
ALTER TYPE "FeedbackCategory" ADD VALUE 'HELP';

-- AlterEnum
ALTER TYPE "FeedbackStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "submittedByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
