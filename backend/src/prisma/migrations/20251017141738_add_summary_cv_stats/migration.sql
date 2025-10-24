/*
  Warnings:

  - You are about to drop the column `average_score` on the `cv_stats` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `cv_stats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bripath"."cv_stats" DROP COLUMN "average_score",
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
