-- DropForeignKey
ALTER TABLE "bripath"."userActivitiesHistory" DROP CONSTRAINT "userActivitiesHistory_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bripath"."userNotifications" DROP CONSTRAINT "userNotifications_user_id_fkey";

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ApplicantsStatus" DEFAULT 'Đang chờ',
    "user_id" TEXT NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userActivitiesHistory" ADD CONSTRAINT "userActivitiesHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userNotifications" ADD CONSTRAINT "userNotifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
