-- CreateTable
CREATE TABLE "bripath"."vnpayOrders" (
    "vnp_TxnRef" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vnpayOrders_pkey" PRIMARY KEY ("vnp_TxnRef")
);

-- AddForeignKey
ALTER TABLE "bripath"."vnpayOrders" ADD CONSTRAINT "vnpayOrders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
