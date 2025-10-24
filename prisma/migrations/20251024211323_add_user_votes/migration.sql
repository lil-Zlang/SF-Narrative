-- CreateTable
CREATE TABLE "UserVote" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "hypePercentage" INTEGER NOT NULL,
    "backlashPercentage" INTEGER NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserVote_eventId_idx" ON "UserVote"("eventId");

-- CreateIndex
CREATE INDEX "UserVote_createdAt_idx" ON "UserVote"("createdAt");

-- AddForeignKey
ALTER TABLE "UserVote" ADD CONSTRAINT "UserVote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TimelineEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
