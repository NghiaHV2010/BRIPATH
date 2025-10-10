-- AlterEnum
ALTER TYPE "bripath"."Job_Type" ADD VALUE 'hybrid';

-- AlterTable
ALTER TABLE "bripath"."awards" ALTER COLUMN "title" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bripath"."careerPathSteps" ALTER COLUMN "title" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bripath"."careerPaths" ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "level" SET DATA TYPE TEXT,
ALTER COLUMN "estimate_duration" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bripath"."certificates" ALTER COLUMN "title" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bripath"."cvs" ALTER COLUMN "fullname" SET DATA TYPE TEXT,
ALTER COLUMN "gender" SET DATA TYPE TEXT,
ALTER COLUMN "address" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "apply_job" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bripath"."educations" ALTER COLUMN "school" SET DATA TYPE TEXT,
ALTER COLUMN "graduated_type" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bripath"."experiences" ALTER COLUMN "company_name" SET DATA TYPE TEXT,
ALTER COLUMN "title" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bripath"."languages" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "level" SET DATA TYPE TEXT;
