# SF Weekly News Digest

**An AI-powered platform that aggregates and summarizes San Francisco news from multiple local sources.**

## What Does This Project Do?

SF Weekly News Digest provides comprehensive weekly summaries of San Francisco news across four key categories:

- **Weekly News Digest**: AI-curated news summaries organized by Technology, Politics, Economy, and SF Local categories
- **Multi-Week Navigation**: Browse news from multiple weeks with an intuitive week selector
- **Interactive News Cards**: Expandable cards with short summaries, in-depth analysis, key developments, and source links
- **AI Q&A Assistant**: Ask questions about any news category to get deeper insights and context
- **Smart Keywords**: Click on keywords to jump between related news stories across categories

## Why Use This Project?

- **Stay Locally Informed**: All news is SF/Bay Area-specific from 20+ local sources
- **Save Time**: Get comprehensive weekly updates in just 5 minutes
- **Understand Context**: AI-powered analysis provides deeper understanding of local issues
- **Explore Multiple Weeks**: Navigate through historical news to track how stories developed

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Components** - Split-screen battle interface, timeline, modals

### Backend
- **Next.js API Routes** - RESTful endpoints for data operations
- **PostgreSQL** - Relational database for storing narratives, votes, and news
- **Prisma ORM** - Type-safe database client and schema management

### External APIs
- **Novita AI API** - LLM-powered news summarization and Q&A chatbot
- **NewsAPI.org** - SF-focused news aggregation
- **Google News RSS** - Fallback news source

### Features
- **Automated Weekly Updates** - News automatically fetched every Saturday at 8am
- Weekly news aggregation from 20+ SF sources
- AI-powered news summarization and analysis
- Interactive Q&A for deeper news exploration
- Multi-week navigation and historical news browsing
- Responsive, mobile-first design

## Project Structure

```
├── app/
│   ├── api/              # API routes (news-qa, weekly-news, seed-weekly-news-real)
│   └── page.tsx          # Main application page
├── components/
│   ├── ui/               # UI components (NewsCard, NewsQAModal, WeekSelector)
│   └── HomeClient.tsx    # Main client component
├── lib/
│   ├── llm.ts            # AI/LLM integration
│   ├── news-api.ts       # News aggregation
│   ├── news-aggregator.ts # News filtering and processing
│   └── types.ts          # TypeScript definitions
├── prisma/
│   └── schema.prisma     # Database schema
└── scripts/              # Utility scripts for data seeding
```

## Automated Updates

The app automatically fetches and creates new weekly news every **Saturday at 8:00 AM UTC** using Vercel Cron Jobs.

**Setup:** See [AUTOMATED_CRON_SETUP.md](./AUTOMATED_CRON_SETUP.md) for deployment instructions.

**Manual Trigger:** You can also manually fetch news anytime via the API endpoint.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push and open a Pull Request

## License

ISC License

---

**Built with ❤️ for San Francisco**