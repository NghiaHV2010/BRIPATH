-- AlterTable
ALTER TABLE "bripath"."applicants" ALTER COLUMN "verified_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "bripath"."users" ADD COLUMN     "phone_verified" BOOLEAN NOT NULL DEFAULT false;
