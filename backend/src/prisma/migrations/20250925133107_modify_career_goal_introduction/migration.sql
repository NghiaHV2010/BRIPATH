/*
  Warnings:

  - Added the required column `users_id` to the `cvs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bripath"."awards" ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "bripath"."certificates" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "bripath"."cvs" ADD COLUMN     "users_id" TEXT NOT NULL,
ALTER COLUMN "address" SET DATA TYPE VARCHAR(200);

-- AlterTable
ALTER TABLE "bripath"."educations" ALTER COLUMN "school" DROP NOT NULL;

-- AlterTable
ALTER TABLE "bripath"."experiences" ALTER COLUMN "company_name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "bripath"."languages" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "level" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "bripath"."projects" ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AddForeignKey
ALTER TABLE "bripath"."cvs" ADD CONSTRAINT "cvs_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
