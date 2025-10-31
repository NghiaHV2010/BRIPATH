-- DropForeignKey
ALTER TABLE "bripath"."cvs" DROP CONSTRAINT "cvs_users_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."feedbacks" DROP CONSTRAINT "feedbacks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."messages" DROP CONSTRAINT "messages_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."personalityTestResults" DROP CONSTRAINT "personalityTestResults_answer_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."personalityTestResults" DROP CONSTRAINT "personalityTestResults_question_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."personalityTestResults" DROP CONSTRAINT "personalityTestResults_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."savedJobs" DROP CONSTRAINT "savedJobs_job_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."savedJobs" DROP CONSTRAINT "savedJobs_user_id_fkey";

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalityTestResults" ADD CONSTRAINT "personalityTestResults_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalityTestResults" ADD CONSTRAINT "personalityTestResults_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalityTestResults" ADD CONSTRAINT "personalityTestResults_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedJobs" ADD CONSTRAINT "savedJobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedJobs" ADD CONSTRAINT "savedJobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
