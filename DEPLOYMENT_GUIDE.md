# SF Narrative Battlefield - Deployment Guide

## ✅ Project Setup Complete!

Your SF Narrative Battlefield application has been successfully set up with all core features implemented.

## What Was Built

### 🎯 Core Features
- ✅ Next.js 14+ with App Router, TypeScript, and Tailwind CSS v4
- ✅ PostgreSQL database schema with Prisma ORM
- ✅ X (Twitter) API integration for fetching SF-related tweets
- ✅ Novita LLM API integration for narrative analysis
- ✅ Automated cron job for weekly data processing
- ✅ Beautiful, responsive UI with timeline and modal views
- ✅ Complete error handling and validation with Zod

### 📁 Project Structure
```
SF-Narrative/
├── app/
│   ├── api/cron/process-trends/route.ts  ← Cron job endpoint
│   ├── page.tsx                          ← Main timeline page
│   ├── layout.tsx                        ← Root layout
│   └── globals.css                       ← Global styles
├── components/
│   ├── TimelineEventCard.tsx             ← Event card component
│   └── BattlefieldModal.tsx              ← Narrative modal
├── lib/
│   ├── prisma.ts                         ← Database client
│   ├── x-api.ts                          ← Twitter integration
│   └── llm.ts                            ← LLM integration
├── prisma/
│   └── schema.prisma                     ← Database schema
├── .env                                  ← Environment variables
└── vercel.json                           ← Deployment config
```

## 🚀 Next Steps: Deployment to Vercel

### Step 1: Configure Environment Variables

You need to add real values to your `.env` file:

```bash
# 1. Vercel Postgres - Get from Vercel Dashboard
#    → Go to your project → Storage → Create Postgres Database
POSTGRES_URL="your-actual-postgres-url"
POSTGRES_PRISMA_URL="your-actual-postgres-prisma-url"

# 2. X API Credentials - Get from Twitter Developer Portal
#    → https://developer.twitter.com/en/portal/dashboard
X_API_KEY="your-x-api-key"
X_API_SECRET="your-x-api-secret"
X_BEARER_TOKEN="your-x-bearer-token"

# 3. Novita LLM API - Get from Novita.ai
#    → https://novita.ai/
NOVITA_API_KEY="your-novita-api-key"

# 4. Cron Secret - Generate a random string
#    → Run: openssl rand -base64 32
CRON_SECRET="your-random-secret"
```

### Step 2: Push Database Schema

Once you have your Vercel Postgres credentials:

```bash
# Push the schema to create the TimelineEvent table
npx prisma db push

# Verify with Prisma Studio
npx prisma studio
```

### Step 3: Test Locally

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

### Step 4: Deploy to Vercel

```bash
# 1. Commit your code
git add .
git commit -m "Complete SF Narrative Battlefield implementation"
git push origin main

# 2. Deploy to Vercel
# Option A: Using Vercel CLI
npx vercel

# Option B: Using Vercel Dashboard
# - Go to https://vercel.com/new
# - Import your GitHub repository
# - Add environment variables in project settings
# - Deploy
```

### Step 5: Configure Vercel Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add all variables from your `.env` file:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `X_API_KEY`
   - `X_API_SECRET`
   - `X_BEARER_TOKEN`
   - `NOVITA_API_KEY`
   - `CRON_SECRET`
3. Make sure they're available for all environments (Production, Preview, Development)

### Step 6: Test the Cron Job

After deployment, manually trigger the cron job to populate data:

```bash
curl -X POST https://your-app.vercel.app/api/cron/process-trends \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📊 Understanding the Data Flow

1. **Cron Job Runs** (Mondays at midnight UTC via `vercel.json`)
   ```
   POST /api/cron/process-trends
   ```

2. **For Each Topic**:
   - Fetch 150 tweets from X API (SF-related)
   - Combine tweet texts
   - Send to Novita LLM for analysis
   - Store results in PostgreSQL

3. **User Visits Site**:
   - Server fetches all TimelineEvents from database
   - Displays timeline with cards
   - Clicking a card opens modal with narrative comparison

## 🎨 Customization

### Modify Weekly Topics

Edit `/app/api/cron/process-trends/route.ts`:

```typescript
const weeklyTopics = [
  { weekOf: '2025-09-01', topic: '#YourTopic' },
  // Add more topics...
];
```

### Adjust Cron Schedule

Edit `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/process-trends",
    "schedule": "0 0 * * 1"  // Cron syntax: https://crontab.guru
  }]
}
```

### Style Changes

All styles are in Tailwind CSS:
- Main colors: Purple gradient background
- Components: `/components/TimelineEventCard.tsx` and `/components/BattlefieldModal.tsx`
- Global styles: `/app/globals.css`

## 🧪 Testing Checklist

- [ ] Environment variables configured
- [ ] Database schema pushed successfully
- [ ] Local dev server runs without errors
- [ ] Cron endpoint responds with authorization
- [ ] At least one topic successfully processed
- [ ] Timeline displays events correctly
- [ ] Modal opens and shows narratives
- [ ] Responsive on mobile devices

## 🐛 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Prisma Client Not Found
```bash
npx prisma generate
```

### Database Connection Error
- Verify `POSTGRES_URL` and `POSTGRES_PRISMA_URL` are correct
- Check Vercel Postgres is running
- Ensure database region matches your deployment

### Cron Job Doesn't Run
- Check Vercel deployment logs
- Verify `CRON_SECRET` matches in environment and requests
- Ensure cron schedule syntax is correct in `vercel.json`

### No Tweets Found
- Verify X API credentials are valid
- Check API rate limits (15 requests per 15 minutes for search)
- Try different/more popular topics

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [X API Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Novita AI Documentation](https://novita.ai/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## 🎉 You're Ready!

Your application is fully built and ready to deploy. Follow the steps above to get it live on Vercel!

**Week 3 #BuildInPublic Challenge** ✅

