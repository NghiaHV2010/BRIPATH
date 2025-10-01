/*
  Warnings:

  - A unique constraint covering the columns `[firebase_uid]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bripath"."users" ADD COLUMN     "firebase_uid" VARCHAR(50);

-- CreateTable
CREATE TABLE "bripath"."events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "working_time" VARCHAR(100),
    "banner_url" TEXT,
    "quantity" INTEGER,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."volunteers" (
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "apply_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_date" TIMESTAMP(3),
    "feedback" VARCHAR(255),
    "status" "bripath"."ApplicantsStatus" NOT NULL DEFAULT 'Đang chờ',

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "bripath"."users"("firebase_uid");

-- AddForeignKey
ALTER TABLE "bripath"."events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."volunteers" ADD CONSTRAINT "volunteers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."volunteers" ADD CONSTRAINT "volunteers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "bripath"."events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
