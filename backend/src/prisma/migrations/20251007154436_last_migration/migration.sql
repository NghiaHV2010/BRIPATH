-- DropForeignKey
ALTER TABLE "bripath"."jobSpecialized" DROP CONSTRAINT "jobSpecialized_jobcategory_id_fkey";

-- AddForeignKey
ALTER TABLE "bripath"."jobSpecialized" ADD CONSTRAINT "jobSpecialized_jobcategory_id_fkey" FOREIGN KEY ("jobcategory_id") REFERENCES "bripath"."jobCategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
