# 🎯 Interactive News Features Documentation

## Overview

Your SF Narrative app now includes two powerful interactive features that make news exploration more immersive and insightful:

1. **AI Q&A for News** - Ask questions about any news category
2. **Hashtag Navigation** - Click keywords to jump to related sections with smooth highlighting

---

## ✨ Feature 1: Ask AI About News

### What It Does

Each news card now has an **"Ask AI"** button that opens an intelligent chatbot specifically trained on that week's news in that category.

### How to Use

1. **Click "Ask AI" button** on any news card (Tech, Politics, Economy, or SF Local)
2. **Chat interface opens** in the bottom-right corner
3. **Ask questions** like:
   - "What are the key developments this week?"
   - "How does this impact SF residents?"
   - "Can you explain the housing situation?"
   - "What should I watch for next?"
4. **Get contextual answers** based on all articles, summaries, and sources
5. **Continue conversation** - the AI remembers your chat history

### AI Capabilities

The AI can:
- ✅ Explain complex news stories in simple terms
- ✅ Connect different stories and show patterns
- ✅ Provide local SF context and implications
- ✅ Answer follow-up questions
- ✅ Cite specific sources when mentioned
- ✅ Admit when information isn't in the context

### Technical Details

**Component**: `NewsQAModal.tsx`
- Floating chat interface
- Minimizable/expandable
- Category-specific styling (blue for tech, purple for politics, etc.)
- Conversation history maintained during session

**API Endpoint**: `/api/news-qa`
- Uses Novita AI (DeepSeek v3.2)
- Context includes: summaries, bullets, keywords, sources
- Temperature: 0.7 (balanced between creative and factual)
- Max tokens: 800 (concise answers)

**Context Provided to AI**:
```typescript
- News category and week
- Short and detailed summaries
- All key developments (bullets)
- Keywords
- Top 5 source articles
- Conversation history
```

---

## 🏷️ Feature 2: Hashtag Navigation with Highlighting

### What It Does

All keywords in news cards are now **clickable hashtags** that:
1. Smooth scroll to the related news category
2. Highlight the target card with an animated ring
3. Auto-remove highlight after 3 seconds

### How to Use

1. **Click any #hashtag** in a news card header
2. **Page smoothly scrolls** to the most relevant category
3. **Target card highlights** with a colored ring (3 seconds)
4. **Continue reading** in the highlighted section

### Smart Keyword Matching

The system intelligently maps keywords to categories:

**Politics Keywords** → Politics Card
- "election", "government", "California", "politics"

**Economy Keywords** → Economy Card
- "economy", "housing", "market", "business"

**Tech Keywords** → Tech Card
- "tech", "startup", "AI", "technology"

**SF Local Keywords** → SF Local Card
- "local", "community", "BART", "transport"

**Exact Matching**:
If a keyword exists in a specific category's keyword list, it jumps directly there.

### Visual Feedback

Each category has distinct highlight colors:
- **Tech**: Blue ring (`ring-blue-400`)
- **Politics**: Purple ring (`ring-purple-400`)
- **Economy**: Green ring (`ring-green-400`)
- **SF Local**: Orange ring (`ring-orange-400`)

### Technical Details

**Component Updates**:
- `NewsCard.tsx`: Added ID, highlight state, clickable hashtags
- `HomeClient.tsx`: Added hashtag click handler and smart routing

**Scroll Behavior**:
```typescript
element.scrollIntoView({ 
  behavior: 'smooth', 
  block: 'center'  // Centers the card in viewport
});
```

**Highlight Animation**:
```typescript
// Show ring for 3 seconds
setHighlightedCategory(targetCategory);
setTimeout(() => setHighlightedCategory(null), 3100);
```

---

## 🎨 User Experience Enhancements

### News Card Updates

**Before**:
```
[Category Badge]                    [#Keyword #Keyword]
Summary text...
[Read More ▼]
```

**After**:
```
[Category Badge]                    [#Keyword #Keyword] ← Clickable!
Summary text...
[Read More ▼] [Ask AI 💬]  ← New button!
```

### Interaction Flow

```
User sees keyword → Clicks hashtag → Smooth scroll → Card highlights
                                    ↓
User clicks "Ask AI" → Modal opens → Ask questions → Get answers
```

---

## 📊 Example Use Cases

### Use Case 1: Deep Dive on Housing

1. User reads Economy summary mentioning "SF Housing Crisis"
2. Clicks **#SF Housing** hashtag
3. Economy card highlights and becomes focus
4. User clicks **"Ask AI"** button
5. Asks: "Why is SF housing still unaffordable?"
6. AI explains: median values, normal vs unaffordable paradox, resident impact
7. Follow-up: "What can be done about it?"
8. AI provides policy context and ongoing initiatives

### Use Case 2: Following a Story Across Categories

1. User sees **#Bay Area Tech Economy** in Tech card
2. Clicks hashtag → jumps to Economy card
3. Reads about tech companies and real estate
4. Clicks **"Ask AI"** on Economy card
5. Asks: "How are tech companies affecting SF housing?"
6. AI connects tech industry growth to housing demand
7. User switches to Politics card's "Ask AI"
8. Asks: "What's the city doing about it?"
9. Gets policy and legislation context

### Use Case 3: Understanding Political Impact

1. User reads about California election monitors
2. Clicks **#California Federal Relations**
3. Jumps to Politics card with highlight
4. Clicks **"Ask AI"**
5. Asks: "What does federal intervention mean for SF?"
6. AI explains local vs federal tensions
7. Follow-up: "Has this happened before?"
8. AI provides historical context

---

## 🔧 Implementation Details

### File Structure

```
app/
├── api/
│   └── news-qa/
│       └── route.ts          # AI Q&A endpoint
components/
├── ui/
│   ├── NewsCard.tsx          # Enhanced with Ask AI + hashtags
│   └── NewsQAModal.tsx       # Chat interface (NEW)
└── HomeClient.tsx            # Navigation logic
```

### State Management

**HomeClient State**:
```typescript
const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
const [qaModalOpen, setQaModalOpen] = useState(false);
const [selectedNews, setSelectedNews] = useState<CategoryNews | null>(null);
```

**NewsCard State**:
```typescript
const [isExpanded, setIsExpanded] = useState(false);
const [showHighlight, setShowHighlight] = useState(false);
```

**NewsQAModal State**:
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [inputValue, setInputValue] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [isMinimized, setIsMinimized] = useState(false);
```

---

## 🎯 Design Principles

### 1. **Immersive Reading**
- Smooth scrolling creates fluid navigation
- Highlighting draws attention without being jarring
- Auto-dismiss prevents permanent distraction

### 2. **Contextual AI**
- Each chat is specific to its news category
- AI has full context of that week's news
- Answers are locally relevant to SF

### 3. **Visual Consistency**
- Category colors carry through (badge → highlight → modal)
- Font: JetBrains Mono throughout
- Button styles match existing design system

### 4. **Progressive Disclosure**
- Hashtags are subtle but discoverable
- "Ask AI" button visible but not overwhelming
- Modal can be minimized to stay accessible

---

## 🧪 Testing the Features

### Test Hashtag Navigation

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:3000
# 1. Scroll to any news card
# 2. Click a #hashtag in the header
# 3. Verify smooth scroll to target
# 4. Verify colored ring appears around target card
# 5. Verify ring disappears after 3 seconds
```

### Test AI Q&A

```bash
# 1. Click "Ask AI" on any news card
# 2. Verify modal opens with category-specific color
# 3. Ask: "What are the key developments?"
# 4. Verify AI responds with relevant answer
# 5. Ask follow-up question
# 6. Verify conversation context is maintained
# 7. Test minimize/expand functionality
# 8. Test close and reopen (should reset conversation)
```

---

## 🚀 Future Enhancements

### Potential Additions

1. **Share Insights**: Export AI conversation summaries
2. **Keyword Filtering**: Click hashtag to filter related articles
3. **Multi-Category QA**: Ask questions across all categories
4. **Voice Input**: Speak questions instead of typing
5. **Suggested Questions**: AI suggests follow-up questions
6. **Bookmark Answers**: Save useful AI responses
7. **Citation Links**: Click mentioned sources to open articles

---

## 📝 Key Benefits

### For Users

✅ **Faster Navigation** - Click hashtags to jump instantly  
✅ **Deeper Understanding** - Ask AI to explain complex topics  
✅ **Local Context** - All answers are SF-specific  
✅ **Conversation Memory** - Build on previous questions  
✅ **Visual Feedback** - Always know where you are  

### For SF Residents

✅ **Personalized Insights** - Ask how news affects your neighborhood  
✅ **Connect Stories** - Understand relationships between events  
✅ **Local Expertise** - AI trained on SF-specific context  
✅ **Quick Learning** - Get up to speed on complex issues fast  

---

## 🎉 Summary

**Before**: Static news cards with summaries  
**After**: Interactive, AI-powered news exploration with intuitive navigation

**New User Actions**:
1. Click hashtags → Jump to sections (with highlight animation)
2. Click "Ask AI" → Deep dive with contextual Q&A
3. Minimize chat → Keep exploring while AI is available
4. Navigate seamlessly → Smooth scrolling between related content

**Result**: A more immersive, engaging, and informative news reading experience specifically designed for San Francisco residents! 🌉

