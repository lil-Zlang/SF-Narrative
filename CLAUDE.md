# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SF Narrative is a Next.js web application that explores San Francisco's trending topics and local news through AI-powered narrative analysis. It fetches data from X (Twitter) API and NewsAPI, analyzes opposing viewpoints using LLMs, and presents them through an interactive split-screen interface.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production (runs `prisma generate` first)
- `npm start` - Start production server
- `npm run lint` - Run Next.js linter

### Database Commands
- `npx prisma generate` - Generate Prisma client (runs automatically on `postinstall`)
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma studio` - Open Prisma Studio GUI for database inspection
- `npx prisma db push` - Push schema changes to database without migrations

### Seeding & Testing Scripts
- `npm run test-x-api` - Test X (Twitter) API connectivity
- `npm run seed-historical` - Seed historical news data
- `npm run seed-historical-mock` - Seed with mock historical data
- `npm run seed-real-news` - Seed real news from Oct 20, 2025 onwards
- `npm run cleanup-weeks` - Clean up duplicate weekly entries

## Architecture

### Data Flow
1. **Timeline Events**: Weekly SF trending topics analyzed for opposing narratives (hype vs backlash)
2. **Weekly News**: Hyper-local SF news aggregated in 4 categories (Tech, Politics, Economy, SF Local)
3. **LLM Analysis**: Novita AI (DeepSeek v3.2) generates narrative summaries and news digests
4. **Evidence Layer**: Structured tweets support each narrative viewpoint
5. **User Interaction**: Split-screen battle interface + voting + AI chatbot

### Key Database Models (Prisma)

**TimelineEvent**
- Represents weekly trending topics in SF
- Fields: `headline`, `weekOf` (unique), `hypeSummary`, `backlashSummary`, `weeklyPulse`
- JSON fields: `hypeTweets`, `backlashTweets`, `communitySentiment`
- Related to `UserVote[]`

**WeeklyNews**
- SF-specific news aggregated by week
- Fields per category (tech/politics/economy/sfLocal): `Summary`, `Detailed`, `Bullets` (JSON), `Sources` (JSON), `Keywords` (JSON)
- Field: `weeklyKeywords` (aggregated JSON array)
- Index on `weekOf` (unique)

**UserVote**
- Tracks user sentiment votes on events
- Fields: `eventId`, `hypePercentage`, `backlashPercentage`
- Cascade deletes with TimelineEvent

### Critical Libraries & Integrations

**API Integrations (lib/)**
- `lib/x-api.ts` - X (Twitter) API v2 client with caching and fallback to mock data
- `lib/llm.ts` - Novita AI integration for narrative analysis and news summarization
- `lib/news-api.ts` - NewsAPI.org + Google News RSS fallback (SF-filtered)
- All use Zod schemas for validation and exponential backoff retry logic

**Utilities**
- `lib/cache.ts` - Simple in-memory cache with TTL (24h default)
- `lib/error-handler.ts` - Centralized error handling with AppError class
- `lib/constants.ts` - All app configuration (API configs, SF geo bounds, UI text)
- `lib/types.ts` - Comprehensive TypeScript interfaces

### Component Architecture

**Main Interactive Components**
- `components/ui/SplitScreenBattle/` - Core battle interface (modular: BattleHeader, ContentPanel, PostBattleAnalysis)
- `components/HomeClient.tsx` - Client-side home page with timeline sidebar + week selector
- `components/TimelineEventCard.tsx` - Wrapper for event display

**UI Components**
- `ChatbotModal.tsx` - AI chat interface for asking questions about events
- `NewsQAModal.tsx` - Q&A interface for weekly news
- `TweetCard.tsx` - Evidence layer tweet display
- `SentimentGauge.tsx` - Visual sentiment comparison (user vs community)
- `NewsCard.tsx` - Weekly news category cards
- `WeekSelector.tsx` - Navigation between weeks

### API Routes

**Timeline Events**
- `POST /api/cron/process-trends` - Cron job to fetch trending topics and generate narratives
- `POST /api/seed-mock-data` - Seed mock timeline events

**Weekly News**
- `GET /api/weekly-news` - Fetch all weekly news
- `GET /api/weekly-news/weeks` - Fetch available weeks
- `GET /api/seed-weekly-news-real` - Seed real SF news (Oct 20+ only)
- `GET /api/seed-weekly-news` - Generate mock weekly news

**User Interaction**
- `POST /api/vote` - Save user sentiment vote
- `POST /api/chatbot` - AI chat about timeline events
- `POST /api/news-qa` - Q&A about weekly news

## Important Implementation Details

### San Francisco Geographic Filtering
All news and tweet queries are filtered for SF/Bay Area relevance:
- Geographic coordinates: 37.7749, -122.4194 (25km radius)
- SF location keywords: San Francisco, Bay Area, BART, Silicon Valley, Oakland, etc.
- Triple filtering: API queries + keyword detection + LLM verification

### News Date Filtering
Weekly news system only includes articles from **Oct 20, 2025 onwards**:
- Check `lib/news-api.ts` for date validation logic
- Articles without valid dates are excluded
- Helps with testing and maintaining data quality

### Caching Strategy
- Tweet data cached for 24h to avoid rate limits
- Cache keys use suffixes: `_tweets`, `_hype_tweets`, `_backlash_tweets`
- In-memory cache clears on server restart (no Redis/persistent cache)

### LLM Retry Logic
All LLM calls use exponential backoff (3 retries default):
- `analyzeNarrativesWithRetry()` - For timeline event narratives
- `summarizeWeeklyNewsWithRetry()` - For news digests
- Base delay: 1000ms, doubles each attempt

### Mock Data Fallbacks
When APIs are unavailable (missing keys, rate limits):
- X API returns topic-specific mock tweets
- News API can fall back to Google News RSS (free, no key required)
- Mock data is deterministic based on topic hash

### Environment Variables Required
```env
POSTGRES_PRISMA_URL="your_postgres_connection_string"
POSTGRES_URL="your_postgres_direct_url"
X_BEARER_TOKEN="your_twitter_bearer_token"
NOVITA_API_KEY="your_novita_api_key"
NEWSAPI_KEY="your_newsapi_key"  # Optional: free at newsapi.org
```

### Next.js Configuration Notes
- `outputFileTracingIncludes` includes Prisma binaries for Vercel serverless
- CSP headers allow `unsafe-eval` for serverless functions
- Prisma binary targets: `["native", "rhel-openssl-3.0.x"]` for compatibility

## Design System

All styling uses centralized constants from `lib/design-system.ts`:
- Font: JetBrains Mono (monospace throughout)
- Colors: Semantic colors (success, error, neutral scales)
- Spacing: Consistent scale (xs: 8px, sm: 16px, md: 24px, lg: 32px, xl: 48px)
- Component styles: Reusable button/input/card definitions

When adding UI, reference design system constants rather than hardcoding values.

## Testing & Debugging

### Test X API Connection
```bash
npm run test-x-api
```
Validates bearer token and fetches sample tweets.

### Inspect Database
```bash
npx prisma studio
```
Opens GUI at http://localhost:5555 to view/edit data.

### Check Rate Limits
X API responses include rate limit headers. Check logs for:
- `x-rate-limit-remaining`
- `x-rate-limit-reset`

### Seed Test Data
For development without API keys:
```bash
# Mock timeline events
curl http://localhost:3000/api/seed-mock-data

# Mock weekly news
curl http://localhost:3000/api/seed-weekly-news
```

## Common Patterns

### Adding a New API Route
1. Create route in `app/api/[route-name]/route.ts`
2. Use `NextRequest`/`NextResponse`
3. Add error handling with try/catch
4. Return JSON with `ApiResponse<T>` interface
5. Add corresponding fetch in client components

### Adding a New Database Model
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Add TypeScript interface in `lib/types.ts`
4. Update API routes to use new model
5. Test with `npx prisma studio`

### Calling LLM for Analysis
```typescript
import { analyzeNarrativesWithRetry } from '@/lib/llm';

const analysis = await analyzeNarrativesWithRetry(topic, combinedTweets);
// Returns: { hypeSummary, backlashSummary, weeklyPulse }
```

### Fetching SF-Filtered News
```typescript
import { fetchSFNews } from '@/lib/news-api';

const articles = await fetchSFNews('tech', '2025-10-20');
// Returns NewsArticle[] filtered for SF/Bay Area
```

## Code Style Conventions

- Use TypeScript for all new code
- Add JSDoc comments for functions explaining purpose, params, returns
- Prefer async/await over Promise chains
- Use Zod schemas to validate external API responses
- Components: PascalCase, files: PascalCase.tsx
- Utilities: camelCase, files: kebab-case.ts
- Always handle errors with try/catch and log with `logError()`
- Use design system constants over magic numbers/colors

## Deployment (Vercel)

The app is configured for Vercel deployment:
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main
4. Prisma generates on build via `npm run build` script

Note: Database migrations must be run manually on production DB before deployment if schema changes.
