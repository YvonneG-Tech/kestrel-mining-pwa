-- CreateEnum
CREATE TYPE "public"."ContractorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "public"."RateType" AS ENUM ('HOURLY', 'DAILY', 'FIXED');

-- CreateEnum
CREATE TYPE "public"."EquipmentType" AS ENUM ('EXCAVATOR', 'BULLDOZER', 'DUMP_TRUCK', 'LOADER', 'CRANE', 'GENERATOR', 'COMPRESSOR', 'DRILL_RIG', 'GRADER', 'WATER_TRUCK', 'FUEL_TRUCK', 'LIGHT_VEHICLE', 'HEAVY_VEHICLE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EquipmentStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'DISPOSED');

-- CreateEnum
CREATE TYPE "public"."OperatorType" AS ENUM ('EMPLOYEE', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "public"."MaintenanceType" AS ENUM ('ROUTINE_SERVICE', 'REPAIR', 'INSPECTION', 'CALIBRATION', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "public"."MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateTable
CREATE TABLE "public"."contractors" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "abn" TEXT,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "status" "public"."ContractorStatus" NOT NULL DEFAULT 'ACTIVE',
    "hourlyRate" DOUBLE PRECISION,
    "dailyRate" DOUBLE PRECISION,
    "emergencyRate" DOUBLE PRECISION,
    "skills" TEXT[],
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "availableFrom" TIMESTAMP(3),
    "availableTo" TIMESTAMP(3),
    "maxHoursPerWeek" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contractor_certifications" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "number" TEXT,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" "public"."DocumentStatus" NOT NULL DEFAULT 'VALID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contractor_assignments" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "agreedRate" DOUBLE PRECISION,
    "rateType" "public"."RateType" NOT NULL DEFAULT 'HOURLY',
    "hoursWorked" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."EquipmentType" NOT NULL,
    "model" TEXT,
    "serialNumber" TEXT,
    "registrationId" TEXT,
    "status" "public"."EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "specifications" JSONB,
    "capacity" TEXT,
    "fuelType" TEXT,
    "isOwned" BOOLEAN NOT NULL DEFAULT true,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "dailyRate" DOUBLE PRECISION,
    "currentLocation" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "lastServiceDate" TIMESTAMP(3),
    "nextServiceDate" TIMESTAMP(3),
    "serviceIntervalKm" INTEGER,
    "serviceIntervalHours" INTEGER,
    "currentKm" INTEGER,
    "currentHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment_usage" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "operatorType" "public"."OperatorType" NOT NULL,
    "workerId" TEXT,
    "contractorId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "location" TEXT,
    "purpose" TEXT,
    "startKm" INTEGER,
    "endKm" INTEGER,
    "startHours" DOUBLE PRECISION,
    "endHours" DOUBLE PRECISION,
    "fuelUsed" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment_maintenance" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "type" "public"."MaintenanceType" NOT NULL,
    "description" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" "public"."MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "cost" DOUBLE PRECISION,
    "supplier" TEXT,
    "kmReading" INTEGER,
    "hoursReading" DOUBLE PRECISION,
    "partsUsed" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment_assignments" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "agreedRate" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contractors_abn_key" ON "public"."contractors"("abn");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_serialNumber_key" ON "public"."equipment"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_registrationId_key" ON "public"."equipment"("registrationId");

-- AddForeignKey
ALTER TABLE "public"."contractor_certifications" ADD CONSTRAINT "contractor_certifications_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "public"."contractors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contractor_assignments" ADD CONSTRAINT "contractor_assignments_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "public"."contractors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_usage" ADD CONSTRAINT "equipment_usage_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_usage" ADD CONSTRAINT "equipment_usage_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_usage" ADD CONSTRAINT "equipment_usage_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "public"."contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_maintenance" ADD CONSTRAINT "equipment_maintenance_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_assignments" ADD CONSTRAINT "equipment_assignments_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
