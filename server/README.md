# AI Study Buddy - Backend Server

A Node.js + Express backend server for the AI Study Buddy application with **session-based conversation memory** and OpenAI integration.

## Features

- ✅ Express server with proper error handling
- ✅ **Session-based conversation memory** (like ChatGPT)
- ✅ Health check endpoint
- ✅ Chat endpoint with full conversation context
- ✅ Session management API
- ✅ Automatic history limiting and cleanup
- ✅ Environment-based configuration
- ✅ Clean, modular code structure

## 🆕 What's New: Session-Based Chat

The backend now maintains **conversation history per session**, allowing multi-turn conversations with full context. See [SESSION_GUIDE.md](SESSION_GUIDE.md) for complete documentation.

**Key Benefits:**
- 💬 AI remembers previous messages in the conversation
- 🔄 Natural multi-turn dialogues
- 📚 Full conversation history retrieval
- ⚡ In-memory storage (fast, no database needed)
- 🧹 Automatic cleanup of expired sessions

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── env.js              # Environment configuration
│   ├── routes/
│   │   ├── health.js           # Health check route
│   │   ├── chat.js             # Chat route (with sessions)
│   │   └── sessions.js         # Session management routes
│   ├── services/
│   │   ├── openaiService.js    # OpenAI integration
│   │   └── sessionStore.js     # In-memory session storage
│   └── index.js                # Main server entry point
├── .env.example                # Example environment variables
├── .gitignore
├── SESSION_GUIDE.md            # Complete session documentation
└── package.json
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your OpenAI API key.

3. **Start the server:**
   ```bash
   # Production
   npm start

   # Development (with auto-reload)
   npm run dev
   ```

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-26T10:30:00.000Z",
  "service": "AI Study Buddy"
}
```

### POST /chat
Send a message to the AI study assistant with session-based memory.

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
  "reply": "Photosynthesis is the process by which plants...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Notes:**
- If `sessionId` is not provided, a new session is created automatically
- Include `sessionId` in subsequent requests to maintain conversation context
- The AI will remember previous messages in the same session

### Session Management Endpoints

**📚 For complete session API documentation, see [SESSION_GUIDE.md](SESSION_GUIDE.md)**

Quick reference:
- `POST /sessions` - Create new session
- `GET /sessions/:sessionId` - Get session history
- `DELETE /sessions/:sessionId` - Delete session
- `GET /sessions` - List all sessions
- `POST /sessions/:sessionId/clear` - Clear history

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `OPENAI_API_KEY` | OpenAI API key | (required) |
| `OPENAI_MODEL` | OpenAI model | gpt-3.5-turbo |

## Error Handling

The server implements proper error handling with meaningful HTTP status codes:

- `400` - Bad Request (invalid input)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `404` - Route Not Found

## Development

The codebase follows these principles:
- Modular architecture with separation of concerns
- Environment-based configuration
- Comprehensive error handling
- Clean, readable code with comments
- No hardcoded secrets
