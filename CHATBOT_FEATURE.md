# Chatbot Feature & UI Improvements

## Overview
Added an interactive AI chatbot powered by DeepSeek (via Novita AI) that allows users to ask follow-up questions about any timeline event's narratives and analysis.

---

## ✅ Changes Implemented

### 1. **UI Improvements**

#### Date & Headline on Same Line
- **Before**: Date was in a separate header above the headline
- **After**: Date (larger, gray) and headline appear on the same line
- **Implementation**: 
  ```tsx
  <div className="flex items-baseline gap-3">
    <span className="text-2xl font-mono font-bold text-gray-400">
      Oct 26
    </span>
    <h2 className="text-xl font-mono font-bold">#HalloweenSF</h2>
  </div>
  ```

#### Reduced Blank Space
- **Split-screen height**: Reduced from `h-96` (384px) to `h-80` (320px)
- **Padding**: Reduced from `p-6` to `p-4`
- **Margins**: Reduced from `mb-3` to `mb-2` for narrative labels
- **Line height**: Changed from `leading-relaxed` to `leading-snug` for text
- **Overall effect**: More compact, less wasted space, better information density

### 2. **Chatbot Feature**

#### A. ChatbotModal Component (`components/ui/ChatbotModal.tsx`)
**Features:**
- ✅ Full-screen modal with context-aware chat interface
- ✅ Message history with user/assistant distinction
- ✅ Real-time typing indicator while AI is thinking
- ✅ Auto-scroll to latest message
- ✅ Auto-focus input on open
- ✅ Context banner showing event name and date
- ✅ Suggested questions to get started
- ✅ Clean, minimal design matching the app aesthetic

**UI Elements:**
- Header with "AI Analysis Assistant" title
- Context info showing current event
- Scrollable message area
- Input field with send button
- Loading animation with bouncing dots
- Close button (× in top-right)

#### B. Chatbot API Route (`app/api/chatbot/route.ts`)
**Features:**
- ✅ Uses **DeepSeek** model via Novita AI
- ✅ Context-aware system prompt with event data
- ✅ Conversation history maintained
- ✅ Error handling with user-friendly messages
- ✅ Streaming disabled for simplicity (instant responses)

**System Prompt:**
```
You are an AI assistant specialized in analyzing San Francisco 
cultural narratives and urban sociology.

CONTEXT FOR THIS CONVERSATION:
Event: [headline] (Week of [date])
Hype Narrative Summary: [...]
Backlash Narrative Summary: [...]
Post-Battle Analysis: [...]

Your role is to:
1. Help users understand the competing narratives
2. Provide deeper insights into cultural/economic/social tensions
3. Connect this event to broader SF patterns
4. Answer questions about evidence and implications
5. Be thoughtful, nuanced, avoid partisan positions
6. Highlight what's missing or oversimplified

Keep responses concise (2-3 paragraphs) unless user asks for detail.
```

#### C. Integration
- **Button Location**: POST-BATTLE ANALYSIS section (top-right)
- **Button Design**: 
  ```tsx
  💬 ASK QUESTIONS
  ```
- **Functionality**: Opens modal, passes full event context
- **Context Data Passed**:
  - Headline
  - Week date
  - Hype summary
  - Backlash summary
  - Weekly pulse (post-battle analysis)
  - Hype tweets (evidence)
  - Backlash tweets (evidence)

---

## 🎯 User Experience Flow

1. **User reads POST-BATTLE ANALYSIS**
2. **Clicks "💬 ASK QUESTIONS" button**
3. **Modal opens with greeting**:
   > "Hi! I'm here to help you explore and understand the '#HalloweenSF' event..."
4. **User types question**:
   - "What are the key tensions?"
   - "Compare the narratives"
   - "What's missing from this analysis?"
5. **AI responds with context-aware analysis**
6. **User continues conversation**
7. **Closes modal when done**

---

## 🛠️ Technical Details

### API Configuration
- **Model**: `deepseek/deepseek-chat`
- **API Endpoint**: `https://api.novita.ai/v3/openai/chat/completions`
- **Authentication**: `NOVITA_API_KEY` from `.env`
- **Max Tokens**: 1000
- **Temperature**: 0.7
- **Streaming**: false

### Cost Optimization
- Uses same Novita API key as LLM analysis
- No streaming = simpler implementation
- Max tokens capped at 1000 for cost control
- Responses kept concise by system prompt

### Error Handling
- Missing API key → 500 error
- Invalid message format → 400 error
- API failure → User sees "Sorry, I encountered an error"
- All errors logged to console for debugging

---

## 📝 Files Modified/Created

### Modified:
1. `components/TimelineEventCard.tsx`
   - Removed separate date header
   - Passed `weekOf` prop to SplitScreenBattle

2. `components/ui/SplitScreenBattle.tsx`
   - Added `weekOf` prop
   - Added date formatting function
   - Created date + headline on same line
   - Reduced heights, padding, margins
   - Changed line-height to `leading-snug`
   - Added chatbot button in POST-BATTLE ANALYSIS
   - Added chatbot modal integration
   - Prepared context data for chatbot

### Created:
1. `components/ui/ChatbotModal.tsx`
   - Full chat interface component

2. `app/api/chatbot/route.ts`
   - DeepSeek API integration

---

## 🎨 Design Choices

### Why DeepSeek?
- **Cost-effective**: More affordable than GPT-4
- **Quality**: Strong performance on analytical tasks
- **Available via Novita**: Same API key, consistent auth

### Why Modal vs Inline?
- **Focus**: Full-screen modal = distraction-free conversation
- **Context**: Clear boundary between reading and asking
- **UX**: Standard pattern users understand

### Why POST-BATTLE ANALYSIS Button?
- **Natural Flow**: User reads analysis → has questions → asks AI
- **Prominent**: Analysis is the "conclusion" where questions arise
- **Non-intrusive**: Button is small but visible

---

## 🚀 Usage Examples

### Example Questions Users Can Ask:

**Understanding Tensions:**
- "What are the underlying economic factors?"
- "Why do people feel so strongly about this?"
- "What historical patterns does this echo?"

**Comparing Narratives:**
- "Which side has stronger evidence?"
- "What do both sides agree on?"
- "What's oversimplified in these narratives?"

**Deeper Analysis:**
- "Who benefits from each narrative?"
- "What's not being talked about?"
- "How does this connect to SF's housing crisis?"

**Evidence Questions:**
- "What do the tweets reveal?"
- "Are there gaps in the evidence?"
- "What voices are missing?"

---

## 🧪 Testing the Feature

### Test Locally:
1. Ensure `NOVITA_API_KEY` is in `.env`
2. Visit `http://localhost:3000`
3. Scroll to any event's POST-BATTLE ANALYSIS
4. Click "💬 ASK QUESTIONS"
5. Type a question and press Send
6. Verify AI responds with context-aware answer

### Expected Behavior:
- ✅ Modal opens instantly
- ✅ Input is auto-focused
- ✅ Greeting message references correct event
- ✅ AI responses are relevant to the specific event
- ✅ Loading indicator shows while AI thinks
- ✅ Messages auto-scroll to bottom
- ✅ Modal closes cleanly

---

## 🎉 Impact

**Before:**
- User reads analysis → accepts it or forms their own opinion
- No way to explore deeper
- Static information delivery

**After:**
- User reads analysis → asks follow-up questions
- Dynamic exploration of narratives
- Personalized learning experience
- Higher engagement with content
- Deeper understanding of SF's cultural dynamics

---

## 🔮 Future Enhancements (Optional)

1. **Conversation History**: Save chats to database per user
2. **Suggested Questions**: Auto-generate based on event
3. **Multi-turn Context**: Remember previous events in conversation
4. **Share Conversations**: Export or share interesting Q&As
5. **Streaming Responses**: Real-time word-by-word delivery
6. **Voice Input**: Speak questions instead of typing
7. **Citations**: AI references specific tweets in answers

---

## ✅ Summary

All requested features implemented:
- ✅ Date and headline on same line (date is bigger)
- ✅ Reduced blank space in narratives (more compact)
- ✅ Chatbot button in POST-BATTLE ANALYSIS
- ✅ DeepSeek model via Novita AI
- ✅ Full conversation interface
- ✅ Context-aware AI responses

The application now offers an interactive, exploratory experience where users can deeply engage with SF's cultural narratives through AI-powered conversations. 🚀

