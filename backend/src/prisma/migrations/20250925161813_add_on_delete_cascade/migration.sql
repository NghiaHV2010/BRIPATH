-- DropForeignKey
ALTER TABLE "bripath"."applicants" DROP CONSTRAINT "applicants_cv_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."applicants" DROP CONSTRAINT "applicants_job_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."awards" DROP CONSTRAINT "awards_cv_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."educations" DROP CONSTRAINT "educations_cv_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."experiences" DROP CONSTRAINT "experiences_cv_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."languages" DROP CONSTRAINT "languages_cv_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."projects" DROP CONSTRAINT "projects_cv_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."references" DROP CONSTRAINT "references_cv_id_fkey";

-- AddForeignKey
ALTER TABLE "bripath"."applicants" ADD CONSTRAINT "applicants_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."applicants" ADD CONSTRAINT "applicants_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "bripath"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."awards" ADD CONSTRAINT "awards_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."languages" ADD CONSTRAINT "languages_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."educations" ADD CONSTRAINT "educations_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."experiences" ADD CONSTRAINT "experiences_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."projects" ADD CONSTRAINT "projects_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."references" ADD CONSTRAINT "references_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
