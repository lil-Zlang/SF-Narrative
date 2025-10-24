# SF Narrative Battlefield

A Next.js application that displays a timeline of San Francisco-centric trending topics with LLM-powered analysis of competing narratives within each trend.

## Features

- 📊 Timeline view of SF trending topics
- 🤖 AI-powered narrative analysis (hype vs backlash)
- 🎨 Beautiful, modern UI with Tailwind CSS
- 📱 Fully responsive design
- ⚡ Built with Next.js 14+ App Router
- 🗄️ PostgreSQL database via Vercel Postgres
- 🔄 Automated data processing via Vercel Cron

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres
- **ORM**: Prisma
- **APIs**: X (Twitter) API, Novita LLM API
- **Deployment**: Vercel
- **Validation**: Zod

## Project Structure

```
SF-Narrative/
├── app/
│   ├── api/
│   │   └── cron/
│   │       └── process-trends/
│   │           └── route.ts          # Cron job API endpoint
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main timeline page
│   └── globals.css                   # Global styles
├── components/
│   ├── TimelineEventCard.tsx         # Timeline event card component
│   └── BattlefieldModal.tsx          # Narrative comparison modal
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── x-api.ts                      # X API integration
│   └── llm.ts                        # Novita LLM integration
├── prisma/
│   └── schema.prisma                 # Database schema
├── .env                              # Environment variables (not in git)
├── .env.example                      # Environment variables template
└── vercel.json                       # Vercel configuration with cron

```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Vercel Postgres (Get from Vercel Dashboard)
POSTGRES_URL="your-vercel-postgres-url"
POSTGRES_PRISMA_URL="your-vercel-postgres-prisma-url"

# X API Credentials (Get from Twitter Developer Portal)
X_API_KEY="your-x-api-key"
X_API_SECRET="your-x-api-secret"
X_BEARER_TOKEN="your-x-bearer-token"

# Novita LLM API (Get from Novita AI)
NOVITA_API_KEY="your-novita-api-key"

# Cron Job Security (Generate a random secret)
CRON_SECRET="your-random-secret-string"
```

### 3. Setup Database

Generate Prisma Client and push the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses a single `TimelineEvent` table:

```prisma
model TimelineEvent {
  id              String   @id @default(cuid())
  headline        String   // The main topic (e.g., "#FleetWeek")
  weekOf          DateTime @unique // Monday of the week
  hypeSummary     String   @db.Text // Positive narrative
  backlashSummary String   @db.Text // Negative narrative
  weeklyPulse     String   @db.Text // City mood summary
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## How It Works

### Data Processing Pipeline

1. **Cron Job** (`/api/cron/process-trends`)
   - Runs weekly (Mondays at midnight UTC)
   - Secured with `CRON_SECRET` authorization
   - Processes predefined weekly topics

2. **Tweet Fetching** (`lib/x-api.ts`)
   - Fetches 100-200 tweets per topic from X API
   - Filters for SF-related content
   - Sorts by relevancy

3. **LLM Analysis** (`lib/llm.ts`)
   - Sends combined tweets to Novita LLM
   - Analyzes for competing narratives:
     - **Hype**: Positive, supportive viewpoints
     - **Backlash**: Negative, critical viewpoints
     - **Weekly Pulse**: Connection to city mood

4. **Database Storage** (`lib/prisma.ts`)
   - Upserts results to PostgreSQL
   - Updates existing entries or creates new ones

### Frontend Components

- **Timeline Page** (`app/page.tsx`)
  - Server Component fetching all events
  - Displays events in chronological order

- **Timeline Event Card** (`components/TimelineEventCard.tsx`)
  - Shows headline, date, and weekly pulse
  - Clickable to open narrative comparison

- **Battlefield Modal** (`components/BattlefieldModal.tsx`)
  - Side-by-side comparison of hype vs backlash
  - Beautiful gradient design with icons

## API Endpoints

### POST `/api/cron/process-trends`

Processes all weekly topics and updates the database.

**Authorization**: Bearer token (CRON_SECRET)

**Response**:
```json
{
  "success": true,
  "processed": 9,
  "failed": 0,
  "results": [...],
  "errors": [...]
}
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard
5. Deploy

### 3. Setup Vercel Postgres

1. In your Vercel project, go to "Storage"
2. Create a new Postgres database
3. Copy the connection strings to your environment variables
4. Run `npx prisma db push` to create tables

### 4. Configure Cron Job

The `vercel.json` file configures a weekly cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-trends",
      "schedule": "0 0 * * 1"
    }
  ]
}
```

Vercel will automatically authenticate cron requests using your `CRON_SECRET`.

## Manual Testing

### Trigger Cron Job Manually

```bash
curl -X POST https://your-domain.vercel.app/api/cron/process-trends \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### View Database in Prisma Studio

```bash
npx prisma studio
```

## Weekly Topics

The application currently processes these SF-centric topics:

- Week of Sept 1, 2025: `#LaborDayWeekend`
- Week of Sept 8, 2025: `#SuperFlexArtFest`
- Week of Sept 15, 2025: `#SupervisorRecall`
- Week of Sept 22, 2025: `#FolsomStreetFair`
- Week of Sept 29, 2025: `#OpenStudios`
- Week of Oct 6, 2025: `#FleetWeek`
- Week of Oct 13, 2025: `#Dreamforce`
- Week of Oct 20, 2025: `#TrumpSFSurge`
- Week of Oct 27, 2025: `#HalloweenSF`

To modify topics, edit the `weeklyTopics` array in `/app/api/cron/process-trends/route.ts`.

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio
```

## Troubleshooting

### Prisma Client Not Found

Run: `npx prisma generate`

### Environment Variables Not Loading

Ensure `.env` file exists in root directory and contains all required variables.

### Cron Job Fails

1. Check Vercel logs for error messages
2. Verify `CRON_SECRET` matches in both environment and request
3. Ensure all API credentials are valid

### No Tweets Found

- Check X API credentials
- Verify API rate limits haven't been exceeded
- Ensure topics are recent and have tweets

## Contributing

This is a Week 3 #BuildInPublic challenge project. Feel free to fork and customize!

## License

ISC

## Acknowledgments

- Week 3 #BuildInPublic Challenge
- Novita AI for LLM API
- Vercel for hosting and database
- X (Twitter) for data access
