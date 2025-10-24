-- AlterTable
ALTER TABLE "bripath"."vnpayOrders" ADD COLUMN     "company_id" TEXT,
ADD COLUMN     "plan_id" INTEGER;

-- AlterTable
ALTER TABLE "bripath"."zalopayOrders" ADD COLUMN     "company_id" TEXT,
ADD COLUMN     "plan_id" INTEGER;
