# AI Study Buddy - Frontend

A responsive chat application for AI Study Buddy with **session-based conversation memory**, built with vanilla JavaScript and Tailwind CSS.

## 🆕 Features

- ✅ **Chat-style interface** (like ChatGPT)
- ✅ **Session-based memory** - Conversations persist across page reloads
- ✅ **Message history display** - User messages on right, AI on left
- ✅ **Auto-scroll** to latest message
- ✅ **Typing indicator** while AI responds
- ✅ **New Chat** button to start fresh conversations
- ✅ **Responsive design** (mobile-friendly)
- ✅ **localStorage persistence** for session management
- ✅ **Clean, modern UI** with Tailwind CSS
- ✅ **Keyboard shortcuts** (Enter to send, Shift+Enter for new line)

## Project Structure

```
client/
├── index.html       # Chat interface with message bubbles
├── script.js        # Session management & API integration
└── README.md        # This file
```

## How to Run

### Option 1: Simple HTTP Server (Python)

```bash
cd client
python3 -m http.server 8080
```

Then open: http://localhost:8080

### Option 2: Live Server (VS Code Extension)

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: Direct File Opening

Open `index.html` directly in your browser. Note: You may encounter CORS issues when making API calls.

## Prerequisites

**Backend Server Must Be Running:**

The frontend expects the backend server to be running on `http://localhost:3001`. 

Start the backend first:

```bash
cd ../server
npm run dev
```

## 💬 How It Works

### Session Management

1. **Page Load**: Generates unique `sessionId` or restores from `localStorage`
2. **Session Persistence**: Session ID stored in `localStorage` survives page reloads
3. **API Calls**: Every message includes `sessionId` to maintain conversation context
4. **New Chat**: "New Chat" button generates fresh session and clears UI

### Chat Flow

1. User types message and submits
2. **User message** appears immediately on the right (blue bubble)
3. **Typing indicator** shows AI is thinking
4. Message sent to `/chat` endpoint with `sessionId`
5. **AI response** appears on the left (gray bubble)
6. Chat auto-scrolls to latest message
7. Session remembers all previous messages

### LocalStorage

```javascript
// Session ID persisted here
localStorage.setItem('aiStudyBuddy_sessionId', sessionId);
```

Clear session:
```javascript
localStorage.removeItem('aiStudyBuddy_sessionId');
// Or click "New Chat" button
```

## UI Components

### Header
- App title and description
- **New Chat** button - Start fresh conversation
- **Session ID display** - Shows active session (first 8 chars)

### Chat Container
- **Scrollable message area** - Full conversation history
- **Welcome message** - Shows on first load
- **Message bubbles**:
  - User messages: Right-aligned, blue background
  - AI messages: Left-aligned, gray background
- **Typing indicator** - Animated dots while waiting

### Input Area
- **Auto-resizing textarea** - Expands as you type (max 150px)
- **Send button** - Disabled while AI responds
- **Tip text** - Reminds users about conversation memory

### Error Handling
- **Error banner** - Top of input area
- **Auto-dismisses** after 5 seconds
- **Close button** - Manual dismiss
- Specific error messages for different scenarios

## Code Structure

### index.html

**Key sections:**
- `<header>` - Title, New Chat button, session display
- `#chatContainer` - Scrollable message area
- `#messagesContainer` - Individual message bubbles
- `#typingIndicator` - Loading animation
- `#errorBanner` - Error messages
- `<form>` - Message input and submit

### script.js

**Configuration:**
```javascript
const API_BASE_URL = 'http://localhost:3001';
const CHAT_ENDPOINT = `${API_BASE_URL}/chat`;
const SESSION_STORAGE_KEY = 'aiStudyBuddy_sessionId';
```

**Session Management:**
- `initializeSession()` - Load or create session
- `generateSessionId()` - UUID v4 generator
- `startNewChat()` - Clear and create new session
- `updateSessionDisplay()` - Update UI with session ID

**Message Handling:**
- `addMessage(role, content)` - Add message bubble to UI
- `scrollToBottom()` - Auto-scroll to latest message
- `escapeHtml(text)` - Prevent XSS attacks

**API Communication:**
- `sendMessage(message)` - POST to backend with sessionId
- Handles success, errors, and session updates

**UI State:**
- `showTypingIndicator()` / `hideTypingIndicator()`
- `showError(message)` / `hideError()`

**Event Handlers:**
- `handleFormSubmit()` - Send message
- `handleNewChat()` - Start new conversation
- `handleTextareaInput()` - Auto-resize textarea
- `handleKeyPress()` - Enter to send, Shift+Enter for newline

## API Integration

### Endpoint
```
POST http://localhost:3001/chat
```

### Request Format
```json
{
  "message": "What is photosynthesis?",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response Format
```json
{
  "reply": "Photosynthesis is the process by which plants...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Note**: Backend returns `sessionId` in response. If it differs from request (e.g., invalid session), frontend updates to use backend's session.

### Error Format
```json
{
  "error": "Error message"
}
```

## Features Breakdown

### 1. Session Persistence
```javascript
// Survives page reload
localStorage.getItem('aiStudyBuddy_sessionId');
```

### 2. Message Bubbles
- User: Right-aligned, blue (`bg-indigo-600`)
- AI: Left-aligned, gray (`bg-gray-100`)
- Smooth slide-in animation

### 3. Auto-Scroll
```javascript
chatContainer.scrollTo({
  top: chatContainer.scrollHeight,
  behavior: 'smooth'
});
```

### 4. Typing Indicator
Animated dots while waiting for AI response

### 5. New Chat Button
Clears UI and generates new session

### 6. Keyboard Shortcuts
- **Enter**: Send message
- **Shift+Enter**: New line

### 7. Auto-Resize Textarea
Expands as you type (up to 150px height)

## Customization

### Change Backend URL
Edit `API_BASE_URL` in [script.js](script.js):

```javascript
const API_BASE_URL = 'http://localhost:3001'; // Change port or domain
```

### Change Color Scheme
Edit Tailwind classes in [index.html](index.html):

```html
<!-- User message: Change from indigo to blue -->
<div class="bg-blue-600 text-white ...">

<!-- AI message: Change from gray to green -->
<div class="bg-green-100 text-gray-800 ...">
```

### Modify Session Storage Key
Edit in [script.js](script.js):

```javascript
const SESSION_STORAGE_KEY = 'myApp_sessionId';
```

## Browser Compatibility

Tested on:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements:**
- localStorage support
- CSS Grid and Flexbox
- Fetch API

## Testing Conversation Memory

### Demo Script

1. **Open the app** - New session created automatically
2. **First message**: "What is machine learning?"
3. **Second message**: "Can you give me an example?" (AI remembers context!)
4. **Third message**: "What about deep learning?" (Full conversation context)
5. **Reload page** - Session persists, but messages not displayed (backend has history)
6. **Click "New Chat"** - Fresh conversation starts

### Verify Session Works

Open browser console (F12) and check logs:
```
🚀 AI Study Buddy initialized
💾 Restored session from localStorage: 550e8400...
✅ Ready to chat!
```

Check localStorage:
```javascript
localStorage.getItem('aiStudyBuddy_sessionId')
// Returns: "550e8400-e29b-41d4-a716-446655440000"
```

## Troubleshooting

### "Unable to connect to server"
- ✅ Backend running on port 3001?
- ✅ Using HTTP server (not file://)?
- ✅ CORS enabled in backend?

### Messages not showing context
- ✅ Check sessionId is being sent in requests (F12 → Network tab)
- ✅ Verify backend session store has messages
- ✅ Check backend logs for session activity

### Session not persisting
- ✅ Check localStorage is enabled in browser
- ✅ Verify `SESSION_STORAGE_KEY` matches
- ✅ Check browser console for errors

### UI looks broken
- ✅ Internet connection (Tailwind CDN)
- ✅ Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- ✅ Check browser console for CSS errors

### Auto-scroll not working
- ✅ Check `chatContainer` scrollHeight
- ✅ Verify smooth scroll is supported
- ✅ Try removing `behavior: 'smooth'` from scroll

## Future Enhancements

Potential additions:
- 📋 **Copy message** button on each bubble
- 💾 **Export conversation** as text/markdown/PDF
- 🔍 **Search** within conversation
- 🌙 **Dark mode** toggle
- ⏱️ **Timestamps** on each message
- 📱 **PWA support** - Install as mobile app
- 🎨 **Themes** - Multiple color schemes
- 🔊 **Text-to-speech** for AI responses
- 📸 **Share conversation** as image
- 💬 **Multiple sessions** - Switch between conversations

## Code Quality

✅ **Well-commented** - Every function documented  
✅ **Modular** - Clear separation of concerns  
✅ **Readable** - Descriptive variable/function names  
✅ **Maintainable** - Easy to extend  
✅ **Secure** - XSS prevention with `escapeHtml()`  
✅ **Responsive** - Mobile-friendly design  

## Demo Ready

This application is perfect for:
- 🎓 Educational demonstrations
- 💡 Student learning projects
- 🚀 Quick prototyping
- 📺 Live coding sessions
- 🧑‍🏫 Teaching session management concepts

The code clearly demonstrates:
- Session-based state management
- LocalStorage persistence  
- REST API integration
- Real-time UI updates
- Error handling best practices
- Extension as a full chat application

The code is well-commented and structured for easy understanding and modification.
