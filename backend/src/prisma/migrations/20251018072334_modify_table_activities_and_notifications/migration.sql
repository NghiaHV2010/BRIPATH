-- AlterTable
ALTER TABLE "bripath"."userActivitiesHistory" ALTER COLUMN "activity_name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bripath"."userNotifications" ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "content" SET DATA TYPE TEXT;
