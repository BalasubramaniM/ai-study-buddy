# AI Study Buddy - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start the Backend

```bash
cd server
npm run dev
```

You should see:
```
🚀 AI Study Buddy server running on port 3001
Environment: development
```

### Step 2: Start the Frontend

Open a new terminal:

```bash
cd client
python3 -m http.server 8080
```

Or use VS Code Live Server extension.

### Step 3: Open in Browser

Navigate to: **http://localhost:8080**

---

## 💬 Test Conversation Memory

Try this conversation to see session memory in action:

### Message 1
```
What is machine learning?
```

### Message 2 (AI remembers context!)
```
Can you give me a simple example?
```

### Message 3 (Full conversation context)
```
How is it different from traditional programming?
```

The AI will understand you're still talking about machine learning! 🎯

---

## ✨ Key Features to Demo

### 1. Session Persistence
- Refresh the page → Session ID stays the same (check header)
- Backend remembers full conversation history

### 2. New Chat Button
- Click "New Chat" in header
- Generates fresh session ID
- Clears message history

### 3. Auto-Scroll
- Messages automatically scroll into view
- Smooth animation

### 4. Typing Indicator
- Shows animated dots while AI thinks
- Input disabled during response

### 5. Error Handling
- Stop backend server
- Try sending message
- See friendly error message

### 6. Keyboard Shortcuts
- **Enter** → Send message
- **Shift+Enter** → New line in message

### 7. Responsive Design
- Resize browser window
- Works great on mobile too!

---

## 🔍 Verify Session Works

### Check Browser Console

Press F12 and look for:
```
🚀 AI Study Buddy initialized
💾 Restored session from localStorage: 550e8400...
✅ Ready to chat!
```

### Check localStorage

In browser console:
```javascript
localStorage.getItem('aiStudyBuddy_sessionId')
// Should return your session ID
```

### Check Network Tab

1. Open DevTools (F12) → Network tab
2. Send a message
3. Click the `/chat` request
4. Check **Payload** tab:
   ```json
   {
     "message": "Your question",
     "sessionId": "550e8400-e29b-41d4-a716-446655440000"
   }
   ```

---

## 🎓 Demo Script for Presentations

### Introduction
"AI Study Buddy is a chat application with conversation memory, similar to ChatGPT."

### Demo Flow

1. **Show the interface**
   - Clean, modern design
   - Chat-style message bubbles
   - Session ID in header

2. **Send first message**
   - "What is photosynthesis?"
   - Show user message appears immediately (right side)
   - Show typing indicator
   - AI response appears (left side)

3. **Demonstrate context awareness**
   - "Can you explain it in simpler terms?"
   - "What about the chemical equation?"
   - Point out AI remembers the conversation!

4. **Show session persistence**
   - Refresh the page
   - Point out session ID is the same
   - Backend still has conversation history

5. **Start new conversation**
   - Click "New Chat" button
   - New session ID generated
   - Fresh conversation starts

6. **Show technical details** (if audience is technical)
   - Open browser console
   - Show localStorage
   - Show Network requests with sessionId

### Key Points to Highlight

✅ **Session-based memory** - Like ChatGPT  
✅ **localStorage persistence** - Survives page reloads  
✅ **Clean architecture** - Backend session store  
✅ **Vanilla JavaScript** - No frameworks needed  
✅ **RESTful API** - Simple POST with sessionId  

---

## 🧪 Advanced Testing

### Test Session Expiry

Backend expires sessions after 1 hour of inactivity.

1. Send messages to create session
2. Wait 1+ hour (or modify `SESSION_TIMEOUT` in backend)
3. Send another message
4. Backend creates new session automatically

### Test Rate Limiting

Send many messages quickly to test OpenAI rate limits.

### Test Multiple Sessions

Open app in multiple browser tabs:
- Regular tab
- Incognito tab
- Different browser

Each gets its own session!

### Test Error Scenarios

1. **Backend down**: Stop server, try sending message
2. **Invalid API key**: Modify `.env` file
3. **Network issues**: Disable internet, try sending

---

## 📂 File Overview

```
client/
├── index.html          # Chat UI with message bubbles
├── script.js           # Session management & API calls
└── README.md          # Detailed documentation

server/
├── src/
│   ├── routes/
│   │   ├── chat.js           # Chat endpoint (with sessions)
│   │   └── sessions.js       # Session management API
│   ├── services/
│   │   ├── openaiService.js  # OpenAI integration
│   │   └── sessionStore.js   # In-memory session storage
│   └── index.js              # Express server
├── SESSION_GUIDE.md   # Session system documentation
└── README.md          # Backend documentation
```

---

## 🎯 What Makes This Special

### Before (Stateless)
- Each message independent
- No conversation context
- AI has no memory

### After (Session-Based)
- Full conversation history
- Context awareness
- Just like ChatGPT!

### Technical Implementation
- Frontend: localStorage + sessionId
- Backend: In-memory session store
- API: Include sessionId in each request
- OpenAI: Send full message history

---

## 🐛 Common Issues

### Port 3001 already in use
```bash
# Kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

### CORS errors
Make sure you're using HTTP server, not opening `file://` directly.

### Tailwind CSS not loading
Check internet connection - CDN needs to be accessible.

### Messages not appearing
Check browser console for JavaScript errors.

---

## 📚 Learn More

- **Backend**: `server/SESSION_GUIDE.md` - Complete session system docs
- **Frontend**: `client/README.md` - Detailed feature documentation
- **API**: Backend README for full API reference

---

## 🎉 Success Checklist

- [x] Backend running on port 3001
- [x] Frontend accessible via HTTP server
- [x] OpenAI API key configured
- [x] Can send messages and get responses
- [x] Messages appear in chat bubbles
- [x] AI remembers conversation context
- [x] Session ID visible in header
- [x] "New Chat" button works
- [x] No console errors

**You're all set!** 🚀

Enjoy building with AI Study Buddy!
