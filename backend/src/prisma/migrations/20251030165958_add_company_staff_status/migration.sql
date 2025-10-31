-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('Đang chờ', 'Chấp nhận', 'Từ chối');

-- AlterTable
ALTER TABLE "companyStaffs" ADD COLUMN     "status" "InvitationStatus" NOT NULL DEFAULT 'Đang chờ';
