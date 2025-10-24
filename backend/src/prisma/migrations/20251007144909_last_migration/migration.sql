/*
  Warnings:

  - You are about to drop the column `category_id` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bripath"."jobs" DROP CONSTRAINT "jobs_category_id_fkey";

-- AlterTable
ALTER TABLE "bripath"."jobs" DROP COLUMN "category_id",
ADD COLUMN     "jobCategory_id" INTEGER;

-- DropTable
DROP TABLE "bripath"."categories";

-- AddForeignKey
ALTER TABLE "bripath"."jobs" ADD CONSTRAINT "jobs_jobCategory_id_fkey" FOREIGN KEY ("jobCategory_id") REFERENCES "bripath"."jobCategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
