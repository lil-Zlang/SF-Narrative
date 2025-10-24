-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "hypeSummary" TEXT NOT NULL,
    "backlashSummary" TEXT NOT NULL,
    "weeklyPulse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimelineEvent_weekOf_key" ON "TimelineEvent"("weekOf");
