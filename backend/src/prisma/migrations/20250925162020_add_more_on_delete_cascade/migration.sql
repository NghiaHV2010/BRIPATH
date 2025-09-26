-- DropForeignKey
ALTER TABLE "bripath"."certificates" DROP CONSTRAINT "certificates_cv_id_fkey";

-- AddForeignKey
ALTER TABLE "bripath"."certificates" ADD CONSTRAINT "certificates_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
