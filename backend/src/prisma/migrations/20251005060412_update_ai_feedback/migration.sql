/*
  Warnings:

  - The primary key for the `aiFeedbacks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `role` to the `aiFeedbacks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bripath"."aiFeedbacks" DROP CONSTRAINT "aiFeedbacks_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "role" VARCHAR(50) NOT NULL,
ADD CONSTRAINT "aiFeedbacks_pkey" PRIMARY KEY ("id");
