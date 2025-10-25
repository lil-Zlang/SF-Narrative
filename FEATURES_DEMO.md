# 🎬 Interactive Features Demo Guide

## Quick Demo Script

### Feature 1: Hashtag Navigation ⚡

**Try This**:
1. Open http://localhost:3000
2. Look at the **Technology** card header
3. See hashtags like `#SF Tech Politics` `#Bay Area Startup` `#Tech CEO`
4. **Click #SF Housing** (or similar economy keyword)
5. **Watch**: Page smoothly scrolls to Economy card
6. **See**: Green ring highlights the Economy card for 3 seconds
7. **Result**: You've jumped to related content!

**Visual Flow**:
```
┌─────────────────────────────────────┐
│  Technology  [#Tech #Startup #SF]   │ ← Click hashtag
└─────────────────────────────────────┘
           ↓ Smooth scroll ↓
┌═══════════════════════════════════════┐
║  Economy    [#Housing #SF]         ║ ← Highlighted!
║  ╔═══════════════════════════════╗ ║
║  ║ San Francisco's housing...     ║ ║
║  ╚═══════════════════════════════╝ ║
└═══════════════════════════════════════┘
   ↑ Colored ring (auto-fades in 3s)
```

---

### Feature 2: Ask AI About News 🤖

**Try This**:
1. Click the **"Ask AI 💬"** button on Economy card
2. Chat modal appears in bottom-right corner
3. Type: **"What's causing SF housing to be unaffordable?"**
4. Press Enter or click "Send"
5. AI analyzes the week's articles and responds!
6. Ask follow-up: **"What can be done about it?"**
7. **Minimize** the chat to keep exploring
8. **Reopen** anytime to continue

**Visual Flow**:
```
┌─────────────────────────────┐
│  Economy                    │
│  San Francisco's housing... │
│  [Read More ▼] [Ask AI 💬]  │ ← Click
└─────────────────────────────┘
                    ↓
        ┌─────────────────────────────────────┐
        │ 💬 Ask About SF Economy             │
        │ ─ × │                               │
        ├─────────────────────────────────────┤
        │ 🤖 Hi! I can help you explore SF    │
        │    economy news...                  │
        │                                     │
        │ 👤 What's causing SF housing to be  │
        │    unaffordable?                    │
        │                                     │
        │ 🤖 Great question! This week's news │
        │    reveals a paradox: studies show  │
        │    housing costs returned to        │
        │    "normal"...                      │
        ├─────────────────────────────────────┤
        │ [Ask about this news...    ] [Send] │
        └─────────────────────────────────────┘
```

---

## 🎯 5-Minute Test Plan

### Test 1: Keyword Navigation (1 min)

✅ Click a hashtag in Tech card  
✅ Verify smooth scroll  
✅ Verify target card highlights  
✅ Verify highlight fades after 3s  

### Test 2: AI Q&A (2 min)

✅ Click "Ask AI" on Politics card  
✅ Ask: "What are the key developments?"  
✅ Verify AI responds with relevant info  
✅ Ask follow-up question  
✅ Verify context is maintained  

### Test 3: Cross-Category Flow (2 min)

✅ Read Tech card  
✅ Click #Housing hashtag → jumps to Economy  
✅ Click "Ask AI" on Economy  
✅ Ask: "How does tech industry affect housing?"  
✅ Verify SF-specific answer  
✅ Minimize chat, keep reading  
✅ Reopen chat, verify history persists  

---

## 🎨 Visual Cues to Notice

### Hashtag Interactions

**Hover State**:
```
Before: [#Housing]           (gray background)
Hover:  [#Housing]           (light gray + gray border)
        ↑ Cursor changes to pointer
```

### Highlight Animation

**Colors by Category**:
- 🔵 **Tech**: Blue ring
- 🟣 **Politics**: Purple ring  
- 🟢 **Economy**: Green ring
- 🟠 **SF Local**: Orange ring

**Animation**: Ring fades in over 300ms, stays 3s, fades out

### Modal States

**Expanded**:
- Full height (600px)
- Shows messages + input
- Minimize icon: `–`

**Minimized**:
- Compact (56px height)
- Shows title only
- Maximize icon: `□`

---

## 💡 Try These Questions

### Technology Q&A

- "What role did tech CEOs play this week?"
- "How does the Disrupt conference impact SF?"
- "What's the 996 work culture controversy?"

### Politics Q&A

- "Why is DOJ monitoring California elections?"
- "How does federal shutdown affect SF?"
- "What's Prop 50 about?"

### Economy Q&A

- "Why is housing still unaffordable?"
- "What's happening with SF real estate?"
- "How are AI cash buyers changing the market?"

### SF Local Q&A

- "What happened with immigration enforcement?"
- "Why were operations canceled?"
- "How is this affecting Bay Area communities?"

---

## 🐛 Troubleshooting

### Hashtag Not Working?

- **Check**: Is there a matching keyword in another category?
- **Try**: Different hashtag
- **Note**: System uses smart matching (e.g., "housing" → Economy)

### AI Not Responding?

- **Check**: `NOVITA_API_KEY` in `.env`
- **Check**: Network connection
- **Check**: Browser console for errors
- **Refresh**: Page and try again

### Highlight Not Showing?

- **Check**: Card has ID `news-{category}`
- **Try**: Click hashtag again
- **Note**: Highlight auto-fades after 3 seconds

---

## 🎓 Best Practices

### For Navigation

✅ **DO**: Click hashtags to explore related content  
✅ **DO**: Use smooth scrolling to maintain context  
❌ **DON'T**: Click too quickly (let animation complete)  

### For AI Q&A

✅ **DO**: Ask specific questions about the news  
✅ **DO**: Use follow-up questions to go deeper  
✅ **DO**: Minimize chat to keep it accessible  
❌ **DON'T**: Ask about topics outside the news context  
❌ **DON'T**: Expect AI to browse external links  

---

## 🎉 What Makes This Special

### Compared to Traditional News Sites

**Traditional**:
- Read article → Back button → Find related article
- No context between stories
- No ability to ask questions

**SF Narrative**:
- Click hashtag → Instant jump with visual feedback
- Ask AI → Get SF-specific insights
- Conversation → Build understanding over multiple questions

### Why It's Better for SF Residents

1. **Local Context**: Every answer is SF-focused
2. **Cross-Category**: Easily connect tech → economy → politics
3. **Conversational**: Ask natural questions, get natural answers
4. **Visual**: Know exactly where you are with highlights
5. **Efficient**: Jump to what matters, skip the rest

---

## 📊 Expected Behavior

### Successful Hashtag Click

```
Action: Click #Housing
Result: 
  ✅ Smooth scroll (0.5s)
  ✅ Green ring appears on Economy card
  ✅ Card centered in viewport
  ✅ Ring fades after 3s
  ✅ Normal reading continues
```

### Successful AI Interaction

```
Action: Click "Ask AI"
Result:
  ✅ Modal opens bottom-right
  ✅ Welcome message appears
  ✅ Suggested questions shown
  ✅ Input field focused
  
Action: Type question + Send
Result:
  ✅ User message appears (black bubble)
  ✅ "Analyzing..." indicator shows
  ✅ AI response appears (gray bubble)
  ✅ Can ask follow-up immediately
```

---

## 🚀 Next Steps

After testing these features:

1. **Explore all categories** - Each has unique content
2. **Try different questions** - AI adapts to your interests  
3. **Follow story threads** - Use hashtags + AI together
4. **Share feedback** - What works? What could be better?

Enjoy your immersive SF news experience! 🌉

