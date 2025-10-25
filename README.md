# SF Narrative

A modern web application that explores San Francisco's trending topics through interactive narrative analysis, built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Interactive Timeline**: Explore SF events through a draggable split-screen interface
- **AI-Powered Analysis**: Get deep insights into competing narratives using advanced LLM analysis
- **Real-time Data**: Fetch and analyze tweets from X (Twitter) API
- **Community Sentiment**: Track and visualize community voting on narrative positions
- **Responsive Design**: Beautiful, mobile-first interface with consistent design system

## 🏗️ Architecture

### Core Components

- **SplitScreenBattle**: Main interactive component for exploring narratives
- **TimelineEventCard**: Wrapper for individual timeline events
- **ChatbotModal**: AI-powered conversation interface
- **TweetCard**: Displays individual tweets with engagement metrics

### Design System

The application uses a comprehensive design system with:
- **Consistent Typography**: JetBrains Mono font family
- **Color Palette**: Semantic colors for success, error, and neutral states
- **Component Styles**: Reusable button, input, and card styles
- **Spacing Scale**: Consistent spacing and sizing throughout

### Error Handling

Centralized error handling with:
- **Custom Error Classes**: `AppError` for application-specific errors
- **Error Codes**: Consistent error identification and handling
- **Logging**: Structured error logging with context
- **User-Friendly Messages**: Clear error messages for users

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chatbot/       # Chatbot API endpoint
│   │   ├── cron/          # Scheduled tasks
│   │   └── vote/          # Voting API endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   │   ├── SplitScreenBattle/  # Main battle component
│   │   ├── ChatbotModal.tsx    # Chat interface
│   │   ├── TweetCard.tsx       # Tweet display
│   │   └── ...                 # Other UI components
│   └── TimelineEventCard.tsx   # Event wrapper
├── lib/                   # Utility libraries
│   ├── constants.ts       # Application constants
│   ├── types.ts          # TypeScript type definitions
│   ├── design-system.ts  # Design system constants
│   ├── utils.ts          # Utility functions
│   ├── error-handler.ts  # Error handling utilities
│   ├── x-api.ts          # X (Twitter) API integration
│   ├── llm.ts            # LLM API integration
│   └── prisma.ts         # Database client
├── prisma/               # Database schema and migrations
└── scripts/              # Utility scripts
```

## 🛠️ Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **APIs**: X (Twitter) API, Novita AI API
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- X (Twitter) API credentials
- Novita AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/sf-narrative.git
   cd sf-narrative
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your API keys and database URL to `.env`:
   ```env
   POSTGRES_PRISMA_URL="your_postgres_url"
   POSTGRES_URL="your_postgres_url"
   X_BEARER_TOKEN="your_twitter_bearer_token"
   NOVITA_API_KEY="your_novita_api_key"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Data Flow

1. **Event Creation**: Cron job fetches trending topics and creates timeline events
2. **Tweet Analysis**: X API provides tweet data for narrative analysis
3. **LLM Processing**: AI analyzes tweets to generate hype/backlash narratives
4. **User Interaction**: Users explore narratives through the split-screen interface
5. **Voting System**: Community sentiment is tracked and visualized
6. **AI Chat**: Users can ask questions about events through the chatbot

## 🎨 Design Principles

### Consistency
- All components use the same design system
- Consistent naming conventions throughout
- Standardized error handling and logging

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly

### Performance
- Optimized API calls with caching
- Lazy loading for large datasets
- Efficient state management

### Maintainability
- Modular component architecture
- Comprehensive TypeScript types
- Clear separation of concerns

## 🔧 Development

### Code Style
- Use TypeScript for all new code
- Follow the established naming conventions
- Add JSDoc comments for all functions
- Use the design system for styling

### Testing
- Write unit tests for utility functions
- Add integration tests for API routes
- Test component behavior with user interactions

### Error Handling
- Use the centralized error handling system
- Log errors with appropriate context
- Provide user-friendly error messages

## 📈 Performance

- **API Optimization**: Cached responses and efficient queries
- **Bundle Size**: Tree-shaking and code splitting
- **Rendering**: Optimized React components with proper memoization
- **Database**: Indexed queries and connection pooling

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. **Connect your repository** to Vercel
2. **Set environment variables** in the Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Week 3 #BuildInPublic Challenge
- Inspired by San Francisco's dynamic cultural landscape
- Powered by the X (Twitter) API and Novita AI

---

**Built with ❤️ for San Francisco**