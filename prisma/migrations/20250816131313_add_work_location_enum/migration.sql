/*
  Warnings:

  - Changed the type of `work_location` on the `job_postings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."WorkLocation" AS ENUM ('onsite', 'remote', 'hybrid');

-- AlterTable
ALTER TABLE "public"."job_postings" DROP COLUMN "work_location",
ADD COLUMN     "work_location" "public"."WorkLocation" NOT NULL;
