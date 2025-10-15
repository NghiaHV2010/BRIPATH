/*
  Warnings:

  - You are about to drop the `Tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bripath"."companyTags" DROP CONSTRAINT "companyTags_tag_id_fkey";

-- DropTable
DROP TABLE "bripath"."Tags";

-- CreateTable
CREATE TABLE "bripath"."tags" (
    "id" SERIAL NOT NULL,
    "label_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_label_name_key" ON "bripath"."tags"("label_name");

-- AddForeignKey
ALTER TABLE "bripath"."companyTags" ADD CONSTRAINT "companyTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "bripath"."tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
