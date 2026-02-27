# Session-Based Chat System

## Overview

The backend now implements a **session-based conversation system** with memory, similar to ChatGPT. Each conversation is tracked in a session with full message history maintained in memory.

## Key Features

✅ **Session Management** - Create, retrieve, and delete conversation sessions  
✅ **Conversation Memory** - Full chat history maintained per session  
✅ **Context Aware** - OpenAI receives full conversation context  
✅ **History Limiting** - Auto-truncates to last 20 messages to prevent token overflow  
✅ **Auto Cleanup** - Expired sessions (1 hour inactive) automatically removed  
✅ **In-Memory Storage** - Fast, no database required (sessions reset on server restart)

## Architecture

### Components

1. **Session Store** ([sessionStore.js](src/services/sessionStore.js))
   - In-memory Map-based storage
   - Session lifecycle management
   - Automatic cleanup of expired sessions

2. **Chat Route** ([chat.js](src/routes/chat.js))
   - Accepts sessionId (optional)
   - Creates new session if not provided
   - Stores messages in session

3. **OpenAI Service** ([openaiService.js](src/services/openaiService.js))
   - Accepts conversation history
   - Builds message array with context
   - Returns assistant response

4. **Session Routes** ([sessions.js](src/routes/sessions.js))
   - CRUD operations for sessions
   - History retrieval
   - Session management endpoints

## API Endpoints

### Chat Endpoint (Updated)

**POST /chat**

Send a message and get AI response with session context.

**Request:**
```json
{
  "message": "Explain photosynthesis",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "reply": "Photosynthesis is the process...",
  "sessionId": "uuid-of-session"
}
```

**Behavior:**
- If `sessionId` is provided and exists, continues that conversation
- If `sessionId` is not provided or invalid, creates a new session
- Returns `sessionId` in response for client to store

---

### Session Management

#### Create New Session
**POST /sessions**

Explicitly create a new session before chatting.

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2026-02-26T10:30:00.000Z"
}
```

---

#### Get Session Info
**GET /sessions/:sessionId**

Retrieve session details and full conversation history.

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "role": "user",
      "content": "What is AI?",
      "timestamp": "2026-02-26T10:30:00.000Z"
    },
    {
      "role": "assistant",
      "content": "AI stands for...",
      "timestamp": "2026-02-26T10:30:02.000Z"
    }
  ],
  "createdAt": "2026-02-26T10:30:00.000Z",
  "lastAccessedAt": "2026-02-26T10:35:00.000Z",
  "messageCount": 4
}
```

---

#### Delete Session
**DELETE /sessions/:sessionId**

Delete a session and all its history.

**Response:**
```json
{
  "message": "Session deleted successfully"
}
```

---

#### List All Sessions
**GET /sessions**

Get all active sessions (useful for debugging).

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "messageCount": 6,
      "createdAt": "2026-02-26T10:30:00.000Z",
      "lastAccessedAt": "2026-02-26T10:35:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### Clear Session History
**POST /sessions/:sessionId/clear**

Clear conversation history but keep session active.

**Response:**
```json
{
  "message": "Conversation history cleared"
}
```

---

## Usage Flow

### Basic Chat Flow

```javascript
// 1. Start new conversation (optional - can skip this)
const sessionResponse = await fetch('http://localhost:3001/sessions', {
  method: 'POST'
});
const { sessionId } = await sessionResponse.json();

// 2. Send first message
const chat1 = await fetch('http://localhost:3001/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What is machine learning?",
    sessionId: sessionId // Optional
  })
});
const response1 = await chat1.json();
console.log(response1.reply);
console.log(response1.sessionId); // Save this!

// 3. Continue conversation with context
const chat2 = await fetch('http://localhost:3001/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Can you give me an example?",
    sessionId: response1.sessionId // Use same session
  })
});
const response2 = await chat2.json();
console.log(response2.reply); // AI remembers previous context!
```

### Retrieve Conversation History

```javascript
const historyResponse = await fetch(
  `http://localhost:3001/sessions/${sessionId}`
);
const history = await historyResponse.json();

// Display all messages in the conversation
history.messages.forEach(msg => {
  console.log(`${msg.role}: ${msg.content}`);
});
```

---

## Configuration

### Session Limits

Edit [sessionStore.js](src/services/sessionStore.js):

```javascript
this.MAX_MESSAGES_PER_SESSION = 20; // Last N messages kept
this.SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
```

### Cleanup Interval

Expired sessions cleaned every 10 minutes (configurable in [sessionStore.js](src/services/sessionStore.js)).

---

## How It Works

### Message Flow

1. **Client sends message** with optional `sessionId`
2. **Server checks session**:
   - Exists? → Use it
   - Doesn't exist? → Create new one
3. **Retrieve conversation history** from session store
4. **Send to OpenAI** with full context:
   ```javascript
   [
     { role: 'system', content: '...' },
     { role: 'user', content: 'first message' },
     { role: 'assistant', content: 'first response' },
     { role: 'user', content: 'second message' } // new
   ]
   ```
5. **Store messages** in session:
   - User message
   - Assistant response
6. **Return reply + sessionId** to client

### History Limiting

- Keeps last **20 messages** (10 exchanges)
- Prevents token overflow with OpenAI
- Oldest messages automatically removed
- System message always included

### Session Cleanup

- Sessions expire after **1 hour** of inactivity
- Automatic cleanup runs every **10 minutes**
- Memory efficient for production use

---

## Testing

### Test with cURL

```bash
# Create session
curl -X POST http://localhost:3001/sessions

# Chat (first message)
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is AI?"}'

# Chat (continue conversation)
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me more", "sessionId":"YOUR-SESSION-ID"}'

# Get history
curl http://localhost:3001/sessions/YOUR-SESSION-ID

# Delete session
curl -X DELETE http://localhost:3001/sessions/YOUR-SESSION-ID
```

---

## Production Considerations

### Current Implementation (In-Memory)

✅ **Pros:**
- Fast and simple
- No database setup required
- Perfect for development/demos

❌ **Cons:**
- Sessions lost on server restart
- Not suitable for multi-server deployments
- Memory usage grows with active sessions

### Production Alternatives

For production, consider replacing in-memory store with:

1. **Redis** - Fast, distributed, persistent
2. **Database** (PostgreSQL, MongoDB) - Permanent storage
3. **Session middleware** (express-session + store)

---

## Migration Guide

### For Frontend

**Before (stateless):**
```javascript
fetch('/chat', {
  method: 'POST',
  body: JSON.stringify({ message: "Hello" })
});
```

**After (with sessions):**
```javascript
// Store sessionId in component state or localStorage
const [sessionId, setSessionId] = useState(null);

const response = await fetch('/chat', {
  method: 'POST',
  body: JSON.stringify({ 
    message: "Hello",
    sessionId: sessionId // Include if exists
  })
});

const data = await response.json();
setSessionId(data.sessionId); // Save for next request
```

---

## Monitoring

### Check Active Sessions

```bash
curl http://localhost:3001/sessions
```

### Server Logs

Session activity is logged:
- ✅ Session created
- 📝 Message added
- 🗑️ Session deleted
- 🧹 Cleanup runs

---

## Example: Full Conversation

```javascript
// Request 1
POST /chat
{ "message": "What is JavaScript?" }

Response:
{
  "reply": "JavaScript is a programming language...",
  "sessionId": "abc-123"
}

// Request 2 (continues conversation)
POST /chat
{
  "message": "What about closures?",
  "sessionId": "abc-123"
}

Response:
{
  "reply": "In JavaScript, closures allow functions to access...",
  "sessionId": "abc-123"
}
// AI has context from previous message!
```

---

## Benefits

🎯 **Context Awareness** - AI remembers previous messages  
🔄 **Natural Conversations** - Multi-turn dialogues  
📚 **History Tracking** - Full conversation retrieval  
⚡ **Performance** - In-memory storage for speed  
🧹 **Auto Management** - Automatic cleanup of old sessions  
🔒 **Session Isolation** - Each user gets their own context

---

## Next Steps

- Update frontend to store and pass `sessionId`
- Add UI for conversation history
- Implement "New Chat" button to create sessions
- Add conversation export feature
- Consider persistent storage for production
