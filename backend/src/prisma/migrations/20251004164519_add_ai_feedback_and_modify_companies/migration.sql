/*
  Warnings:

  - You are about to drop the column `address_city` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `address_country` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `address_street` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `address_ward` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `company_name` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `logo_url` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `phone_verified` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `companies` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "bripath"."companies_email_key";

-- DropIndex
DROP INDEX "bripath"."companies_phone_key";

-- AlterTable
ALTER TABLE "bripath"."companies" DROP COLUMN "address_city",
DROP COLUMN "address_country",
DROP COLUMN "address_street",
DROP COLUMN "address_ward",
DROP COLUMN "company_name",
DROP COLUMN "created_at",
DROP COLUMN "email",
DROP COLUMN "email_verified",
DROP COLUMN "is_deleted",
DROP COLUMN "logo_url",
DROP COLUMN "phone",
DROP COLUMN "phone_verified",
DROP COLUMN "updated_at",
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "status" "bripath"."ApplicantsStatus" NOT NULL DEFAULT 'Đang chờ';

-- AlterTable
ALTER TABLE "bripath"."cvs" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "bripath"."events" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "status" "bripath"."ApplicantsStatus" NOT NULL DEFAULT 'Đang chờ';

-- CreateTable
CREATE TABLE "bripath"."aiFeedbacks" (
    "job_id" TEXT NOT NULL,
    "cv_id" INTEGER NOT NULL,
    "is_good" BOOLEAN NOT NULL DEFAULT false,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aiFeedbacks_pkey" PRIMARY KEY ("job_id","cv_id")
);

-- AddForeignKey
ALTER TABLE "bripath"."aiFeedbacks" ADD CONSTRAINT "aiFeedbacks_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."aiFeedbacks" ADD CONSTRAINT "aiFeedbacks_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "bripath"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
