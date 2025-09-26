/*
  Warnings:

  - You are about to drop the `companyActivitiesHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `companyNotifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bripath"."companyActivitiesHistory" DROP CONSTRAINT "companyActivitiesHistory_company_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."companyNotifications" DROP CONSTRAINT "companyNotifications_company_id_fkey";

-- AlterTable
ALTER TABLE "bripath"."cvs" ADD COLUMN     "apply_job" VARCHAR(50),
ADD COLUMN     "career_goal" TEXT;

-- DropTable
DROP TABLE "bripath"."companyActivitiesHistory";

-- DropTable
DROP TABLE "bripath"."companyNotifications";

-- CreateTable
CREATE TABLE "bripath"."languages" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "certificate" TEXT,
    "level" VARCHAR(10),
    "cv_id" INTEGER NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."reviews" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "stars" REAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bripath"."languages" ADD CONSTRAINT "languages_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
