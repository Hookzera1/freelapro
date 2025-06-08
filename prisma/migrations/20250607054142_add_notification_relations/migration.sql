-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "relatedId" TEXT;
ALTER TABLE "Notification" ADD COLUMN "relatedType" TEXT;

-- CreateIndex
CREATE INDEX "Notification_relatedId_idx" ON "Notification"("relatedId");
