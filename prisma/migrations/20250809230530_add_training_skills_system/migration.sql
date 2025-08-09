/*
  Warnings:

  - You are about to drop the column `skills` on the `contractors` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TrainingCategory" AS ENUM ('SAFETY', 'TECHNICAL', 'COMPLIANCE', 'LEADERSHIP', 'EQUIPMENT_OPERATION', 'EMERGENCY_RESPONSE', 'ENVIRONMENTAL', 'QUALITY_ASSURANCE', 'SOFT_SKILLS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DeliveryMethod" AS ENUM ('IN_PERSON', 'ONLINE', 'HYBRID', 'ON_THE_JOB', 'SIMULATION');

-- CreateEnum
CREATE TYPE "public"."AssessmentType" AS ENUM ('WRITTEN', 'PRACTICAL', 'OBSERVATION', 'COMBINATION', 'NONE');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "public"."ParticipantType" AS ENUM ('EMPLOYEE', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."Performance" AS ENUM ('EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'POOR');

-- CreateEnum
CREATE TYPE "public"."SkillCategory" AS ENUM ('TECHNICAL', 'SAFETY', 'EQUIPMENT_OPERATION', 'LEADERSHIP', 'COMMUNICATION', 'PROBLEM_SOLVING', 'PHYSICAL', 'REGULATORY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SkillLevel" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."RequirementType" AS ENUM ('MANDATORY', 'RECOMMENDED', 'ROLE_SPECIFIC', 'REGULATORY', 'SAFETY_CRITICAL');

-- AlterTable
ALTER TABLE "public"."contractors" DROP COLUMN "skills",
ADD COLUMN     "skillTags" TEXT[];

-- CreateTable
CREATE TABLE "public"."training_programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."TrainingCategory" NOT NULL,
    "provider" TEXT,
    "duration" INTEGER NOT NULL,
    "validityPeriod" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "renewalRequired" BOOLEAN NOT NULL DEFAULT false,
    "prerequisites" TEXT[],
    "minExperience" INTEGER,
    "deliveryMethod" "public"."DeliveryMethod" NOT NULL DEFAULT 'IN_PERSON',
    "materials" JSONB,
    "assessmentType" "public"."AssessmentType" NOT NULL DEFAULT 'PRACTICAL',
    "passingScore" INTEGER,
    "cost" DOUBLE PRECISION,
    "maxParticipants" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_sessions" (
    "id" TEXT NOT NULL,
    "trainingProgramId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "instructor" TEXT,
    "maxParticipants" INTEGER,
    "status" "public"."SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "materials" JSONB,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_enrollments" (
    "id" TEXT NOT NULL,
    "trainingProgramId" TEXT NOT NULL,
    "participantType" "public"."ParticipantType" NOT NULL,
    "workerId" TEXT,
    "contractorId" TEXT,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "deadline" TIMESTAMP(3),
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "finalScore" INTEGER,
    "passed" BOOLEAN,
    "certificateIssued" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_attendances" (
    "id" TEXT NOT NULL,
    "trainingSessionId" TEXT NOT NULL,
    "trainingEnrollmentId" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "arrivalTime" TIMESTAMP(3),
    "departureTime" TIMESTAMP(3),
    "hoursAttended" DOUBLE PRECISION,
    "score" INTEGER,
    "passed" BOOLEAN,
    "feedback" TEXT,
    "performance" "public"."Performance",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."SkillCategory" NOT NULL,
    "level" "public"."SkillLevel" NOT NULL DEFAULT 'BASIC',
    "requiresCertification" BOOLEAN NOT NULL DEFAULT false,
    "certificationAuthority" TEXT,
    "validityPeriod" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."worker_skills" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" "public"."SkillLevel" NOT NULL,
    "experienceYears" DOUBLE PRECISION,
    "lastUsed" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "certificationDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "certificationNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contractor_skills" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" "public"."SkillLevel" NOT NULL,
    "experienceYears" DOUBLE PRECISION,
    "lastUsed" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "certificationDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "certificationNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_skills" (
    "id" TEXT NOT NULL,
    "trainingProgramId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "levelProvided" "public"."SkillLevel" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "training_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_skill_requirements" (
    "id" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "department" TEXT,
    "skillId" TEXT NOT NULL,
    "requiredLevel" "public"."SkillLevel" NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_skill_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_requirements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."RequirementType" NOT NULL,
    "appliesToAllWorkers" BOOLEAN NOT NULL DEFAULT false,
    "appliesToDepartments" TEXT[],
    "appliesToRoles" TEXT[],
    "trainingProgramId" TEXT,
    "deadline" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceMonths" INTEGER,
    "gracePeridDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_TrainingEnrollmentToTrainingRequirement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TrainingEnrollmentToTrainingRequirement_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "public"."skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "worker_skills_workerId_skillId_key" ON "public"."worker_skills"("workerId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_skills_contractorId_skillId_key" ON "public"."contractor_skills"("contractorId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "training_skills_trainingProgramId_skillId_key" ON "public"."training_skills"("trainingProgramId", "skillId");

-- CreateIndex
CREATE INDEX "_TrainingEnrollmentToTrainingRequirement_B_index" ON "public"."_TrainingEnrollmentToTrainingRequirement"("B");

-- AddForeignKey
ALTER TABLE "public"."training_sessions" ADD CONSTRAINT "training_sessions_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "public"."training_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_enrollments" ADD CONSTRAINT "training_enrollments_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "public"."training_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_enrollments" ADD CONSTRAINT "training_enrollments_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_enrollments" ADD CONSTRAINT "training_enrollments_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "public"."contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_attendances" ADD CONSTRAINT "training_attendances_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "public"."training_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_attendances" ADD CONSTRAINT "training_attendances_trainingEnrollmentId_fkey" FOREIGN KEY ("trainingEnrollmentId") REFERENCES "public"."training_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."worker_skills" ADD CONSTRAINT "worker_skills_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."worker_skills" ADD CONSTRAINT "worker_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contractor_skills" ADD CONSTRAINT "contractor_skills_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "public"."contractors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contractor_skills" ADD CONSTRAINT "contractor_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_skills" ADD CONSTRAINT "training_skills_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "public"."training_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_skills" ADD CONSTRAINT "training_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_skill_requirements" ADD CONSTRAINT "job_skill_requirements_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_requirements" ADD CONSTRAINT "training_requirements_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "public"."training_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TrainingEnrollmentToTrainingRequirement" ADD CONSTRAINT "_TrainingEnrollmentToTrainingRequirement_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."training_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TrainingEnrollmentToTrainingRequirement" ADD CONSTRAINT "_TrainingEnrollmentToTrainingRequirement_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."training_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
