# Automated Weekly News Fetching Setup

This app is configured to automatically fetch and create weekly news every **Saturday at 8:00 AM UTC** using Vercel Cron Jobs.

## How It Works

1. **Vercel Cron Job** triggers every Saturday at 8am
2. Calls `/api/seed-weekly-news-real` endpoint
3. Fetches latest news from 20+ SF sources
4. Generates AI summaries using Novita AI
5. Saves to database as a new week
6. Users see the new week automatically

## Setup Instructions

### 1. Deploy to Vercel

```bash
npm run build
vercel --prod
```

### 2. Add Environment Variables

In your Vercel project dashboard, add these environment variables:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NOVITA_API_KEY` - For AI summarization ([Get key](https://novita.ai))
- `NEWS_API_KEY` - For news aggregation ([Get key](https://newsapi.org))

**For Cron Security:**
- `CRON_SECRET` - Random secret to authenticate cron requests

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. Configure Vercel Cron

The cron job is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/seed-weekly-news-real",
      "schedule": "0 8 * * 6"
    }
  ]
}
```

**Schedule Breakdown:**
- `0` - Minute (0th minute)
- `8` - Hour (8 AM UTC)
- `*` - Day of month (every day)
- `*` - Month (every month)
- `6` - Day of week (6 = Saturday)

### 4. Verify Cron Setup

After deployment, verify the cron job in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Cron Jobs**
3. You should see: `Saturday at 8:00 AM UTC`

### 5. Monitor Cron Execution

View cron logs in Vercel:

1. Go to **Deployments** → Select your deployment
2. Click **Functions** tab
3. Find `/api/seed-weekly-news-real`
4. View execution logs and errors

## Manual Triggering

You can also manually trigger the news fetch:

### Using cURL:
```bash
curl -X GET "https://your-app.vercel.app/api/seed-weekly-news-real" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Using Browser:
Visit: `https://your-app.vercel.app/api/seed-weekly-news-real`

(Only works if CRON_SECRET is not set, for development)

## Customizing the Schedule

To change when news is fetched, edit `vercel.json`:

### Every Friday at 6pm UTC:
```json
"schedule": "0 18 * * 5"
```

### Every Monday at midnight UTC:
```json
"schedule": "0 0 * * 1"
```

### Daily at 9am UTC:
```json
"schedule": "0 9 * * *"
```

### Cron Format Reference:
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

## Troubleshooting

### Cron job not running

1. **Check Vercel plan**: Cron jobs require Hobby plan or higher
2. **Verify environment variables**: Ensure all API keys are set
3. **Check logs**: View function logs in Vercel dashboard
4. **Test manually**: Try calling the endpoint directly

### Authentication errors

- Ensure `CRON_SECRET` is set in Vercel environment variables
- Vercel automatically adds this header to cron requests
- For manual testing, include: `Authorization: Bearer YOUR_CRON_SECRET`

### Rate limiting

- The endpoint includes 2-second delays between AI summaries
- Maximum execution time is 60 seconds
- If hitting rate limits, increase delays or reduce article count

### Database errors

- Verify `DATABASE_URL` is correct
- Ensure database is accessible from Vercel
- Check Prisma schema is up to date: `npx prisma generate`

## Development Testing

Test the cron endpoint locally:

```bash
# Start dev server
npm run dev

# In another terminal, trigger the endpoint
curl http://localhost:3000/api/seed-weekly-news-real
```

## Cost Considerations

**Vercel:**
- Hobby plan: 1 cron job included (free)
- Pro plan: 5 cron jobs included ($20/month)

**API Costs:**
- Novita AI: ~$0.01 per week (4 summaries)
- NewsAPI: Free tier allows 100 requests/day

**Total estimated cost:** ~$0.50/month (excluding Vercel hosting)

## Monitoring Best Practices

1. **Set up alerts**: Use Vercel integrations (Slack, Discord) for cron failures
2. **Check weekly**: Verify new weeks are being created
3. **Monitor API quotas**: Keep track of NewsAPI and Novita AI usage
4. **Review logs**: Check for errors or warnings in Vercel logs

## Next Steps

After setup:
- ✅ Weekly news will be automatically fetched every Saturday
- ✅ Users will see new weeks without manual intervention
- ✅ The app stays up-to-date with latest SF news
- ✅ Zero maintenance required for weekly updates

## Questions?

Check the logs in Vercel dashboard or review the API endpoint code:
`app/api/seed-weekly-news-real/route.ts`

