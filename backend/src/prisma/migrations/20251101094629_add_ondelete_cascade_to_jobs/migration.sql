-- DropForeignKey
ALTER TABLE "bripath"."job_stats" DROP CONSTRAINT "job_stats_job_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."job_views" DROP CONSTRAINT "job_views_job_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."job_views" DROP CONSTRAINT "job_views_user_id_fkey";

-- AddForeignKey
ALTER TABLE "job_stats" ADD CONSTRAINT "job_stats_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
