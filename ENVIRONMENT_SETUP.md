# Environment Variables Setup

This document lists all required environment variables for the SF Weekly News Digest application.

## Required Variables

### Database
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```
- **Purpose:** PostgreSQL database connection
- **Where to get:** Your PostgreSQL hosting provider (e.g., Vercel Postgres, Supabase, Railway)
- **Example:** `postgresql://postgres:password@localhost:5432/sf_news`

### Novita AI API
```env
NOVITA_API_KEY="your-novita-api-key-here"
```
- **Purpose:** AI-powered news summarization and Q&A chatbot
- **Where to get:** [https://novita.ai](https://novita.ai) (Sign up for free tier)
- **Cost:** ~$0.01 per week for summaries
- **Model used:** `deepseek/deepseek-v3.2-exp`

### NewsAPI
```env
NEWS_API_KEY="your-newsapi-key-here"
```
- **Purpose:** Primary news aggregation source
- **Where to get:** [https://newsapi.org](https://newsapi.org) (Free tier: 100 requests/day)
- **Cost:** Free (or $449/month for production tier)
- **Note:** Google RSS is used as fallback if NewsAPI fails

### Cron Secret (For Automated Updates)
```env
CRON_SECRET="your-random-secret-here"
```
- **Purpose:** Authenticate automated weekly news fetching
- **Generate:** `openssl rand -base64 32`
- **Example:** `gX8fK2nP9mL4jH6sQ1wR7tY5vC3xZ0bA`
- **Required for:** Vercel Cron Jobs to work securely

## Setup Instructions

### For Local Development

1. Create a `.env` file in the project root:
```bash
touch .env
```

2. Add all variables:
```env
DATABASE_URL="postgresql://localhost:5432/sf_news"
NOVITA_API_KEY="your-novita-key"
NEWS_API_KEY="your-newsapi-key"
CRON_SECRET="local-dev-secret"
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Start the dev server:
```bash
npm run dev
```

### For Vercel Deployment

1. Go to your Vercel project dashboard

2. Navigate to **Settings** → **Environment Variables**

3. Add each variable:
   - Variable name: `DATABASE_URL`
   - Value: Your PostgreSQL connection string
   - Environment: Production, Preview, Development

4. Repeat for all variables:
   - `NOVITA_API_KEY`
   - `NEWS_API_KEY`
   - `CRON_SECRET`

5. Redeploy:
```bash
vercel --prod
```

## Generating Secure Secrets

### For CRON_SECRET:
```bash
openssl rand -base64 32
```

### Alternative (Node.js):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Verifying Setup

### Check Database Connection:
```bash
npx prisma db push
```

### Test News API:
```bash
curl "https://newsapi.org/v2/everything?q=San+Francisco&apiKey=YOUR_KEY"
```

### Test Novita AI:
```bash
curl https://api.novita.ai/v3/openai/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek/deepseek-v3.2-exp","messages":[{"role":"user","content":"test"}]}'
```

### Test Cron Endpoint:
```bash
curl -X GET "http://localhost:3000/api/seed-weekly-news-real" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` format is correct
- Verify database is accessible
- Run `npx prisma db push` to create tables

### "Novita API error"
- Verify `NOVITA_API_KEY` is set correctly
- Check account has credits
- Test API key with curl command above

### "NewsAPI rate limit"
- Free tier: 100 requests/day
- App automatically falls back to Google RSS
- Consider upgrading to Developer plan if needed

### "Cron job unauthorized"
- Ensure `CRON_SECRET` is set in Vercel
- Check secret matches in both .env and Vercel
- Vercel adds this automatically to cron requests

## Security Notes

⚠️ **Never commit `.env` file to git**
- Already in `.gitignore`
- Use `.env.example` for documentation

⚠️ **Keep CRON_SECRET secure**
- Generate a strong random secret
- Don't share in public repos
- Rotate periodically for security

⚠️ **Protect API keys**
- Don't expose in client-side code
- Only use in API routes (server-side)
- Monitor usage for unexpected spikes

## Cost Summary

| Service | Free Tier | Paid Tier | Usage |
|---------|-----------|-----------|-------|
| Vercel | 1 cron job | Unlimited | 1 job/week |
| Novita AI | $5 credit | Pay as you go | ~$0.01/week |
| NewsAPI | 100 req/day | $449/month | ~10 req/week |
| Database | Varies | Varies | Minimal |

**Estimated total:** ~$0.50/month (excluding hosting)

## Next Steps

1. ✅ Set all environment variables
2. ✅ Run `npm run build` to verify setup
3. ✅ Deploy to Vercel
4. ✅ Verify cron job is scheduled
5. ✅ Wait for first Saturday or trigger manually

## Questions?

- Check [AUTOMATED_CRON_SETUP.md](./AUTOMATED_CRON_SETUP.md) for cron configuration
- Review API documentation for each service
- Check Vercel logs for deployment issues

