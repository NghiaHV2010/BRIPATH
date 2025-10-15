/*
  Warnings:

  - You are about to drop the column `label_id` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `duration_days` on the `membershipPlans` table. All the data in the column will be lost.
  - You are about to drop the `companyLabels` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `duration_months` to the `membershipPlans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bripath"."companies" DROP CONSTRAINT "companies_label_id_fkey";

-- AlterTable
ALTER TABLE "bripath"."companies" DROP COLUMN "label_id";

-- AlterTable
ALTER TABLE "bripath"."jobLabels" ADD COLUMN     "duration_days" INTEGER;

-- AlterTable
ALTER TABLE "bripath"."jobs" ADD COLUMN     "label_end_at" TIMESTAMP(3),
ADD COLUMN     "label_start_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "bripath"."membershipPlans" DROP COLUMN "duration_days",
ADD COLUMN     "ai_matchings" BOOLEAN DEFAULT false,
ADD COLUMN     "ai_networking_limit" INTEGER,
ADD COLUMN     "duration_months" SMALLINT NOT NULL,
ADD COLUMN     "highlighted_hot_jobs" BOOLEAN DEFAULT false,
ADD COLUMN     "quality_jobs_limit" INTEGER,
ADD COLUMN     "recommended_labels" BOOLEAN DEFAULT false,
ADD COLUMN     "total_jobs_limit" INTEGER,
ADD COLUMN     "urgent_jobs_limit" INTEGER,
ADD COLUMN     "verified_badge" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "bripath"."subscriptions" ADD COLUMN     "remaining_fast" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "remaining_quality" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "bripath"."companyLabels";

-- CreateTable
CREATE TABLE "bripath"."companyTags" (
    "company_id" TEXT NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "companyTags_pkey" PRIMARY KEY ("company_id","tag_id")
);

-- CreateTable
CREATE TABLE "bripath"."Tags" (
    "id" SERIAL NOT NULL,
    "label_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tags_label_name_key" ON "bripath"."Tags"("label_name");

-- AddForeignKey
ALTER TABLE "bripath"."companyTags" ADD CONSTRAINT "companyTags_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "bripath"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."companyTags" ADD CONSTRAINT "companyTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "bripath"."Tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
