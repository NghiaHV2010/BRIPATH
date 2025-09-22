-- CreateEnum
CREATE TYPE "bripath"."ApplicantsStatus" AS ENUM ('Đang chờ', 'Chấp nhận', 'Từ chối');

-- CreateEnum
CREATE TYPE "bripath"."Company_Type" AS ENUM ('Hộ kinh doanh', 'Doanh nghiệp');

-- CreateEnum
CREATE TYPE "bripath"."Education" AS ENUM ('Cử nhân', 'Thạc sĩ', 'Tiến sĩ', 'Khác', 'Tốt nghiệp trung học phổ thông');

-- CreateEnum
CREATE TYPE "bripath"."Gender" AS ENUM ('Nam', 'Nữ', 'Khác');

-- CreateEnum
CREATE TYPE "bripath"."Job_Status" AS ENUM ('Hết hạn', 'Đang mở');

-- CreateEnum
CREATE TYPE "bripath"."Job_Type" AS ENUM ('remote', 'Part time', 'Full time', 'Khác');

-- CreateEnum
CREATE TYPE "bripath"."NotificationsType" AS ENUM ('Hệ thống', 'Gói đăng ký', 'Hồ sơ', 'Đang theo dõi');

-- CreateEnum
CREATE TYPE "bripath"."PaymentGateway" AS ENUM ('MoMo', 'Bank', 'ZaloPay', 'Stripe');

-- CreateEnum
CREATE TYPE "bripath"."PaymentMethod" AS ENUM ('Thẻ ngân hàng', 'Ví điện tử', 'Chuyển khoản', 'Mã QR');

-- CreateEnum
CREATE TYPE "bripath"."PaymentStatus" AS ENUM ('Thành công', 'Thất bại');

-- CreateEnum
CREATE TYPE "bripath"."SubscriptionStatus" AS ENUM ('Còn hạn', 'Hết hạn', 'Đã hủy');

-- CreateTable
CREATE TABLE "bripath"."answers" (
    "id" SERIAL NOT NULL,
    "answer" VARCHAR(150) NOT NULL,
    "embedding" vector,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."applicants" (
    "cv_id" INTEGER NOT NULL,
    "job_id" TEXT NOT NULL,
    "description" TEXT,
    "apply_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_date" TIMESTAMP(3) NOT NULL,
    "status" "bripath"."ApplicantsStatus" NOT NULL DEFAULT 'Đang chờ',
    "feedback" TEXT,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("cv_id","job_id")
);

-- CreateTable
CREATE TABLE "bripath"."awards" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "cv_id" INTEGER NOT NULL,

    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."blogs" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "cover_image_url" TEXT NOT NULL,
    "description_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."careerPathSteps" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "resources" TEXT,
    "career_id" INTEGER NOT NULL,

    CONSTRAINT "careerPathSteps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."careerPaths" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "resources" TEXT,
    "level" VARCHAR(100),
    "estimate_duration" VARCHAR(50),
    "user_id" TEXT NOT NULL,
    "jobspecialized_id" INTEGER NOT NULL,

    CONSTRAINT "careerPaths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."categories" (
    "id" SERIAL NOT NULL,
    "category_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."certificates" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "link" TEXT,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "cv_id" INTEGER NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."companies" (
    "id" TEXT NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "company_website" TEXT,
    "address_street" VARCHAR(50) NOT NULL,
    "address_ward" VARCHAR(50) NOT NULL,
    "address_city" VARCHAR(50) NOT NULL,
    "address_country" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(12) NOT NULL,
    "business_certificate" TEXT,
    "company_type" "bripath"."Company_Type" NOT NULL DEFAULT 'Hộ kinh doanh',
    "description" TEXT,
    "logo_url" TEXT,
    "background_url" TEXT,
    "employees" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "fax_code" VARCHAR(20),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "field_id" INTEGER,
    "label_id" INTEGER,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."companyActivitiesHistory" (
    "id" SERIAL NOT NULL,
    "activity_name" VARCHAR(100) NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "companyActivitiesHistory_pkey" PRIMARY KEY ("id","company_id")
);

-- CreateTable
CREATE TABLE "bripath"."companyLabels" (
    "id" SERIAL NOT NULL,
    "label_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "companyLabels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."companyNotifications" (
    "id" SERIAL NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" VARCHAR(255),
    "type" "bripath"."NotificationsType" NOT NULL DEFAULT 'Hệ thống',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "companyNotifications_pkey" PRIMARY KEY ("id","company_id")
);

-- CreateTable
CREATE TABLE "bripath"."cvs" (
    "id" SERIAL NOT NULL,
    "fullname" VARCHAR(50) NOT NULL,
    "age" INTEGER,
    "gender" VARCHAR(10),
    "address" VARCHAR(150),
    "email" VARCHAR(50),
    "introduction" TEXT,
    "soft_skills" TEXT[],
    "primary_skills" TEXT[],
    "phone" VARCHAR(12),
    "hobbies" TEXT,
    "others" TEXT,
    "embedding" vector,

    CONSTRAINT "cvs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."educations" (
    "id" SERIAL NOT NULL,
    "school" VARCHAR(100) NOT NULL,
    "graduated_type" VARCHAR(50),
    "gpa" REAL,
    "start_date" DATE,
    "end_date" DATE,
    "cv_id" INTEGER NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."experiences" (
    "id" SERIAL NOT NULL,
    "company_name" VARCHAR(150),
    "title" VARCHAR(150),
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "cv_id" INTEGER NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."features" (
    "id" SERIAL NOT NULL,
    "feature_name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "plan_id" INTEGER,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."feedbacks" (
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stars" REAL NOT NULL,
    "work_environment" TEXT,
    "benefit" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("user_id","company_id")
);

-- CreateTable
CREATE TABLE "bripath"."fields" (
    "id" SERIAL NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."followedCompanies" (
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "followed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_notified" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "followedCompanies_pkey" PRIMARY KEY ("user_id","company_id")
);

-- CreateTable
CREATE TABLE "bripath"."jobCategories" (
    "id" SERIAL NOT NULL,
    "job_category" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "embedding" vector,

    CONSTRAINT "jobCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."jobLabels" (
    "id" SERIAL NOT NULL,
    "label_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "jobLabels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."jobSpecialized" (
    "id" SERIAL NOT NULL,
    "job_type" VARCHAR(100) NOT NULL,
    "description" VARCHAR(150),
    "embedding" vector,
    "jobcategory_id" INTEGER NOT NULL,

    CONSTRAINT "jobSpecialized_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."jobs" (
    "id" TEXT NOT NULL,
    "job_title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(150),
    "benefit" VARCHAR(255),
    "working_time" VARCHAR(50),
    "salary" TEXT[] DEFAULT ARRAY['Thỏa thuận']::TEXT[],
    "currency" VARCHAR(3) DEFAULT 'VND',
    "job_type" "bripath"."Job_Type",
    "status" "bripath"."Job_Status",
    "job_level" VARCHAR(50) NOT NULL,
    "quantity" INTEGER,
    "skill_tags" TEXT[],
    "education" "bripath"."Education",
    "experience" TEXT,
    "embedding" vector,
    "start_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" INTEGER,
    "label_id" INTEGER,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."membershipPlans" (
    "id" SERIAL NOT NULL,
    "plan_name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "price" BIGINT NOT NULL,
    "duration_days" SMALLINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membershipPlans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."messages" (
    "id" SERIAL NOT NULL,
    "message_content" TEXT,
    "response_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id","user_id")
);

-- CreateTable
CREATE TABLE "bripath"."payments" (
    "id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" VARCHAR(10),
    "payment_gateway" "bripath"."PaymentGateway" NOT NULL,
    "payment_method" "bripath"."PaymentMethod" NOT NULL,
    "transaction_id" VARCHAR(100),
    "status" "bripath"."PaymentStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."personalityTestResults" (
    "user_id" TEXT NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_id" INTEGER NOT NULL,

    CONSTRAINT "personalityTestResults_pkey" PRIMARY KEY ("user_id","question_id","answer_id")
);

-- CreateTable
CREATE TABLE "bripath"."projects" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "cv_id" INTEGER NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."questions" (
    "id" SERIAL NOT NULL,
    "question" VARCHAR(100) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."references" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(12),
    "email" VARCHAR(50),
    "cv_id" INTEGER NOT NULL,

    CONSTRAINT "references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."roles" (
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."savedJobs" (
    "user_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savedJobs_pkey" PRIMARY KEY ("user_id","job_id")
);

-- CreateTable
CREATE TABLE "bripath"."subscriptions" (
    "id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "amount_paid" BIGINT NOT NULL,
    "is_extended" BOOLEAN NOT NULL DEFAULT false,
    "status" "bripath"."SubscriptionStatus" NOT NULL DEFAULT 'Còn hạn',
    "user_id" TEXT NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "payment_id" TEXT NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."userActivitiesHistory" (
    "id" SERIAL NOT NULL,
    "activity_name" VARCHAR(100) NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "userActivitiesHistory_pkey" PRIMARY KEY ("id","user_id")
);

-- CreateTable
CREATE TABLE "bripath"."userNotifications" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" VARCHAR(255),
    "type" "bripath"."NotificationsType" NOT NULL DEFAULT 'Hệ thống',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "userNotifications_pkey" PRIMARY KEY ("id","user_id")
);

-- CreateTable
CREATE TABLE "bripath"."users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "avatar_url" TEXT,
    "email" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(12),
    "address_street" VARCHAR(50),
    "address_ward" VARCHAR(50),
    "address_city" VARCHAR(50),
    "address_country" VARCHAR(50),
    "gender" "bripath"."Gender",
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "careerPaths_jobspecialized_id_key" ON "bripath"."careerPaths"("jobspecialized_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "bripath"."categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "companies_company_name_key" ON "bripath"."companies"("company_name");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "bripath"."companies"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_phone_key" ON "bripath"."companies"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "companyLabels_label_name_key" ON "bripath"."companyLabels"("label_name");

-- CreateIndex
CREATE UNIQUE INDEX "fields_field_name_key" ON "bripath"."fields"("field_name");

-- CreateIndex
CREATE UNIQUE INDEX "jobCategories_job_category_key" ON "bripath"."jobCategories"("job_category");

-- CreateIndex
CREATE UNIQUE INDEX "jobLabels_label_name_key" ON "bripath"."jobLabels"("label_name");

-- CreateIndex
CREATE UNIQUE INDEX "questions_question_key" ON "bripath"."questions"("question");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "bripath"."roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_payment_id_key" ON "bripath"."subscriptions"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "bripath"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "bripath"."users"("phone");

-- AddForeignKey
ALTER TABLE "bripath"."answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "bripath"."questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."applicants" ADD CONSTRAINT "applicants_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."applicants" ADD CONSTRAINT "applicants_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "bripath"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."awards" ADD CONSTRAINT "awards_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."blogs" ADD CONSTRAINT "blogs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."careerPathSteps" ADD CONSTRAINT "careerPathSteps_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "bripath"."careerPaths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."careerPaths" ADD CONSTRAINT "careerPaths_jobspecialized_id_fkey" FOREIGN KEY ("jobspecialized_id") REFERENCES "bripath"."jobSpecialized"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."careerPaths" ADD CONSTRAINT "careerPaths_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."certificates" ADD CONSTRAINT "certificates_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."companies" ADD CONSTRAINT "companies_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "bripath"."fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."companies" ADD CONSTRAINT "companies_id_fkey" FOREIGN KEY ("id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."companies" ADD CONSTRAINT "companies_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "bripath"."companyLabels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."companyActivitiesHistory" ADD CONSTRAINT "companyActivitiesHistory_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "bripath"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."companyNotifications" ADD CONSTRAINT "companyNotifications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "bripath"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."educations" ADD CONSTRAINT "educations_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."experiences" ADD CONSTRAINT "experiences_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."features" ADD CONSTRAINT "features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "bripath"."membershipPlans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."feedbacks" ADD CONSTRAINT "feedbacks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "bripath"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."feedbacks" ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."followedCompanies" ADD CONSTRAINT "followedCompanies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "bripath"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."followedCompanies" ADD CONSTRAINT "followedCompanies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."jobSpecialized" ADD CONSTRAINT "jobSpecialized_jobcategory_id_fkey" FOREIGN KEY ("jobcategory_id") REFERENCES "bripath"."jobCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."jobs" ADD CONSTRAINT "jobs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "bripath"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."jobs" ADD CONSTRAINT "jobs_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "bripath"."jobLabels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."personalityTestResults" ADD CONSTRAINT "personalityTestResults_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "bripath"."answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."personalityTestResults" ADD CONSTRAINT "personalityTestResults_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "bripath"."questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."personalityTestResults" ADD CONSTRAINT "personalityTestResults_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."projects" ADD CONSTRAINT "projects_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."references" ADD CONSTRAINT "references_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."savedJobs" ADD CONSTRAINT "savedJobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "bripath"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."savedJobs" ADD CONSTRAINT "savedJobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."subscriptions" ADD CONSTRAINT "subscriptions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "bripath"."payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "bripath"."membershipPlans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."userActivitiesHistory" ADD CONSTRAINT "userActivitiesHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."userNotifications" ADD CONSTRAINT "userNotifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "bripath"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
