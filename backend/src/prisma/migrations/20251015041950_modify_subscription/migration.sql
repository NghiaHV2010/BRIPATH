/*
  Warnings:

  - You are about to drop the column `remaining_fast` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `remaining_quality` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bripath"."subscriptions" DROP COLUMN "remaining_fast",
DROP COLUMN "remaining_quality",
ADD COLUMN     "remaining_quality_jobs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "remaining_total_jobs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "remaining_urgent_jobs" INTEGER NOT NULL DEFAULT 0;
