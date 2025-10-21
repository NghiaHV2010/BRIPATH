/*
  Warnings:

  - You are about to drop the `vnpayOrders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `zalopayOrders` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "PaymentGateway" ADD VALUE 'SePay';

-- DropForeignKey
ALTER TABLE "bripath"."vnpayOrders" DROP CONSTRAINT "vnpayOrders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."zalopayOrders" DROP CONSTRAINT "zalopayOrders_user_id_fkey";

-- DropTable
DROP TABLE "bripath"."vnpayOrders";

-- DropTable
DROP TABLE "bripath"."zalopayOrders";

-- CreateTable
CREATE TABLE "sepayOrders" (
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "plan_id" INTEGER,
    "company_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sepayOrders_pkey" PRIMARY KEY ("order_id")
);

-- AddForeignKey
ALTER TABLE "sepayOrders" ADD CONSTRAINT "sepayOrders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
