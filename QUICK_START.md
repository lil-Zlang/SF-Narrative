# SF Narrative Battlefield - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Configure Environment Variables

Edit the `.env` file and add your API credentials:

```bash
# Open .env and replace placeholders with real values
# You can use 'cat .env' to view the current file
```

**Required credentials:**
- **Vercel Postgres**: Get from Vercel Dashboard → Storage → Create Postgres
- **X API**: Get from https://developer.twitter.com/en/portal/dashboard
- **Novita API**: Get from https://novita.ai/
- **CRON_SECRET**: Generate with `openssl rand -base64 32`

### Step 2: Setup Database

```bash
# Push the schema to create the TimelineEvent table
npx prisma db push

# (Optional) View your database
npx prisma studio
```

### Step 3: Run Development Server

```bash
# Start the app
npm run dev

# Open http://localhost:3000 in your browser
```

### Step 4: Test the Cron Job (Optional)

```bash
# Manually trigger to populate initial data
curl -X POST http://localhost:3000/api/cron/process-trends \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# This will take 2-3 minutes to process all 9 topics
```

### Step 5: Deploy to Vercel

```bash
# Commit your changes
git add .
git commit -m "Configure SF Narrative Battlefield"
git push origin main

# Deploy with Vercel CLI
npx vercel

# Or deploy via Vercel Dashboard:
# 1. Go to https://vercel.com/new
# 2. Import your GitHub repository
# 3. Add environment variables
# 4. Click Deploy
```

## 📋 Environment Variables Checklist

Make sure you have all these in your `.env` file:

- [ ] `POSTGRES_URL`
- [ ] `POSTGRES_PRISMA_URL`
- [ ] `X_API_KEY`
- [ ] `X_API_SECRET`
- [ ] `X_BEARER_TOKEN`
- [ ] `NOVITA_API_KEY`
- [ ] `CRON_SECRET`

## 🎯 Weekly Topics Currently Configured

The app will process these SF-centric topics:

1. Week of Sept 1: `#LaborDayWeekend`
2. Week of Sept 8: `#SuperFlexArtFest`
3. Week of Sept 15: `#SupervisorRecall`
4. Week of Sept 22: `#FolsomStreetFair`
5. Week of Sept 29: `#OpenStudios`
6. Week of Oct 6: `#FleetWeek`
7. Week of Oct 13: `#Dreamforce`
8. Week of Oct 20: `#TrumpSFSurge`
9. Week of Oct 27: `#HalloweenSF`

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to database
npx prisma studio        # Open database GUI

# Deployment
npx vercel               # Deploy to Vercel
npx vercel --prod        # Deploy to production
```

## 📁 Project Structure Overview

```
SF-Narrative/
├── app/
│   ├── api/cron/process-trends/route.ts  # Cron job endpoint
│   ├── page.tsx                          # Main page
│   └── layout.tsx                        # Root layout
├── components/
│   ├── TimelineEventCard.tsx             # Event card
│   └── BattlefieldModal.tsx              # Narrative modal
├── lib/
│   ├── prisma.ts                         # Database client
│   ├── x-api.ts                          # Twitter API
│   └── llm.ts                            # Novita LLM
└── prisma/
    └── schema.prisma                     # Database schema
```

## 🐛 Troubleshooting

### "Prisma Client Not Found"
```bash
npx prisma generate
```

### "Environment Variables Not Loaded"
- Make sure `.env` file exists in the root directory
- Check that all required variables are set
- Restart the dev server after changing `.env`

### "Database Connection Error"
- Verify your `POSTGRES_URL` and `POSTGRES_PRISMA_URL`
- Make sure Vercel Postgres database is running
- Check that you've run `npx prisma db push`

### "No Tweets Found"
- Verify your X API credentials are valid
- Check if you've exceeded API rate limits (15 requests per 15 min)
- Try with more popular/recent topics

### Build Fails
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Full Documentation

For detailed information, see:
- **README.md** - Complete project documentation
- **DEPLOYMENT_GUIDE.md** - Step-by-step deployment instructions
- **PROJECT_SUMMARY.md** - Implementation details and architecture

## 🎉 You're All Set!

Your SF Narrative Battlefield application is ready to go. Just configure your environment variables and you can start processing SF narrative data!

---

**Need Help?** Check the full README.md or DEPLOYMENT_GUIDE.md for more details.

