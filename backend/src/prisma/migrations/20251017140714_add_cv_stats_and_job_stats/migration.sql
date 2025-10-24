-- CreateTable
CREATE TABLE "bripath"."cv_stats" (
    "id" SERIAL NOT NULL,
    "cv_id" INTEGER NOT NULL,
    "technical" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "communication" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "teamwork" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "problem_solving" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creativity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leadership" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "average_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cv_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."job_stats" (
    "id" SERIAL NOT NULL,
    "job_id" TEXT NOT NULL,
    "technical" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "communication" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "teamwork" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "problem_solving" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creativity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leadership" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bripath"."job_views" (
    "id" SERIAL NOT NULL,
    "job_id" TEXT NOT NULL,
    "user_id" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cv_stats_cv_id_key" ON "bripath"."cv_stats"("cv_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_stats_job_id_key" ON "bripath"."job_stats"("job_id");

-- AddForeignKey
ALTER TABLE "bripath"."cv_stats" ADD CONSTRAINT "cv_stats_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "bripath"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."job_stats" ADD CONSTRAINT "job_stats_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "bripath"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."job_views" ADD CONSTRAINT "job_views_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "bripath"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bripath"."job_views" ADD CONSTRAINT "job_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bripath"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
