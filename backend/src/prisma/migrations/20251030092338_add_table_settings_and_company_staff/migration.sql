-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('Phê duyệt', 'Đăng tải', 'Cả hai');

-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('single_choice', 'multi_choice', 'custom');

-- CreateTable
CREATE TABLE "companyStaffs" (
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission" "Permission" NOT NULL DEFAULT 'Phê duyệt',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companyStaffs_pkey" PRIMARY KEY ("company_id","user_id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50),
    "type" "SettingType" NOT NULL DEFAULT 'multi_choice',

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userSettings" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "setting_id" INTEGER NOT NULL,
    "setting_option_id" INTEGER,
    "custom_value" VARCHAR(255),

    CONSTRAINT "userSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settingsOptions" (
    "id" SERIAL NOT NULL,
    "setting_id" INTEGER NOT NULL,
    "option" VARCHAR(100) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "settingsOptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companyStaffs_user_id_key" ON "companyStaffs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "userSettings_user_id_setting_id_key" ON "userSettings"("user_id", "setting_id");

-- AddForeignKey
ALTER TABLE "companyStaffs" ADD CONSTRAINT "companyStaffs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companyStaffs" ADD CONSTRAINT "companyStaffs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userSettings" ADD CONSTRAINT "userSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userSettings" ADD CONSTRAINT "userSettings_setting_id_fkey" FOREIGN KEY ("setting_id") REFERENCES "settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userSettings" ADD CONSTRAINT "userSettings_setting_option_id_fkey" FOREIGN KEY ("setting_option_id") REFERENCES "settingsOptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settingsOptions" ADD CONSTRAINT "settingsOptions_setting_id_fkey" FOREIGN KEY ("setting_id") REFERENCES "settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
