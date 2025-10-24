-- CreateTable
CREATE TABLE "bripath"."zalopayOrders" (
    "app_trans_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zalopayOrders_pkey" PRIMARY KEY ("app_trans_id")
);

-- AddForeignKey
ALTER TABLE "bripath"."zalopayOrders" ADD CONSTRAINT "zalopayOrders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
