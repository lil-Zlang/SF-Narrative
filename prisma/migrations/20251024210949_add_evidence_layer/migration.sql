-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "backlashTweets" JSONB,
ADD COLUMN     "communitySentiment" JSONB,
ADD COLUMN     "hypeTweets" JSONB;
