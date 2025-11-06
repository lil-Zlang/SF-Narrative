# Vercel Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Configuration Files
- [x] `vercel.json` - Cron schedule set to Friday (`0 8 * * 5`)
- [x] `app/api/seed-weekly-news-real/route.ts` - Fixed date parsing and authentication
- [x] `components/ui/WeekSelector.tsx` - Fixed week number calculation

### 2. Environment Variables Required in Vercel
Make sure these are set in your Vercel project settings:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NOVITA_API_KEY` - AI summarization API key
- [ ] `NEWS_API_KEY` - News aggregation API key  
- [ ] `CRON_SECRET` - Secret for cron authentication (generate with: `openssl rand -base64 32`)

### 3. Database Setup
- [ ] Database tables are created (run `npx prisma generate` before deployment)
- [ ] Database is accessible from Vercel's network

### 4. Vercel Cron Configuration
- [x] Cron schedule: Friday at 8:00 AM UTC (`0 8 * * 5`)
- [x] Endpoint path: `/api/seed-weekly-news-real`
- [x] Authentication: Uses `CRON_SECRET` environment variable

## 🚀 Deployment Steps

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Fix week numbers and update cron to Friday"
   git push
   ```

2. **Vercel will automatically deploy** (if connected to Git)

3. **Verify environment variables** in Vercel Dashboard:
   - Go to Settings → Environment Variables
   - Ensure all required variables are set for Production

4. **Check Cron Job** in Vercel Dashboard:
   - Go to Settings → Cron Jobs
   - Verify it shows: "Friday at 8:00 AM UTC"

5. **Test the endpoint manually:**
   ```bash
   curl -X GET "https://your-app.vercel.app/api/seed-weekly-news-real" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

## 📋 What Will Work After Deployment

✅ **Cron Job**: Will run every Friday at 8:00 AM UTC
✅ **Week Calculation**: Sunday-starting weeks matching calendar format
✅ **Date Parsing**: Properly handles timezone issues
✅ **Authentication**: Secure with CRON_SECRET
✅ **Week Generation**: Automatically creates new week each Friday

## ⚠️ Important Notes

1. **First Run**: The cron job will run on the next Friday after deployment
2. **Monitoring**: Check Vercel function logs if cron doesn't run
3. **Rate Limits**: NewsAPI has 100 requests/day on free tier
4. **Execution Time**: Endpoint has 60 second max duration

## 🔍 Troubleshooting

If cron doesn't work:
1. Check Vercel plan (Hobby plan or higher required)
2. Verify CRON_SECRET is set in environment variables
3. Check function logs in Vercel dashboard
4. Test endpoint manually with curl

