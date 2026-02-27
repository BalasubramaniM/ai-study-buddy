const express = require('express');
const router = express.Router();
const openaiService = require('../services/openaiService');
const sessionStore = require('../services/sessionStore');

/**
 * Chat endpoint with session-based memory
 * POST /chat
 * Body: { message: string, sessionId?: string }
 * Response: { reply: string, sessionId: string }
 */
router.post('/', async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: message field is required and must be a string'
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request: message cannot be empty'
      });
    }

    // Get or create session
    let activeSessionId = sessionId;
    
    if (!activeSessionId || !sessionStore.hasSession(activeSessionId)) {
      // Create new session if not provided or doesn't exist
      activeSessionId = sessionStore.createSession();
      console.log(`🆕 New session created for chat: ${activeSessionId}`);
    } else {
      console.log(`♻️  Using existing session: ${activeSessionId}`);
    }

    // Get conversation history for this session
    const conversationHistory = sessionStore.getHistory(activeSessionId);

    // Get response from OpenAI with conversation context
    const reply = await openaiService.getChatCompletion(message, conversationHistory);

    // Store user message and assistant reply in session
    sessionStore.addMessage(activeSessionId, 'user', message);
    sessionStore.addMessage(activeSessionId, 'assistant', reply);

    // Return reply with session ID
    res.status(200).json({ 
      reply,
      sessionId: activeSessionId
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
});

module.exports = router;
