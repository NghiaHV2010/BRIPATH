/*
  Warnings:

  - Added the required column `company_id` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bripath"."jobs" ADD COLUMN     "company_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "bripath"."jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "bripath"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
