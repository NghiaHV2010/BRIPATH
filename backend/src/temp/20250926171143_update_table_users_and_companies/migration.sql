/*
  Warnings:

  - You are about to alter the column `fax_code` on the `companies` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(10)`.
  - A unique constraint covering the columns `[fax_code]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "bripath"."companies" DROP CONSTRAINT "companies_id_fkey";

-- AlterTable
ALTER TABLE "bripath"."companies" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone_verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "fax_code" SET DATA TYPE VARCHAR(10);

-- AlterTable
ALTER TABLE "bripath"."users" ADD COLUMN     "company_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "companies_fax_code_key" ON "bripath"."companies"("fax_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_company_id_key" ON "bripath"."users"("company_id");

-- AddForeignKey
ALTER TABLE "bripath"."users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "bripath"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
