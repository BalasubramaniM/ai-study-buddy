const express = require('express');
const router = express.Router();
const sessionStore = require('../services/sessionStore');

/**
 * Create a new session
 * POST /sessions
 * Response: { sessionId: string, createdAt: Date }
 */
router.post('/', (req, res) => {
  const sessionId = sessionStore.createSession();
  const session = sessionStore.getSession(sessionId);
  
  res.status(201).json({
    sessionId,
    createdAt: session.createdAt
  });
});

/**
 * Get session information and history
 * GET /sessions/:sessionId
 * Response: { sessionId, messages, createdAt, lastAccessedAt, messageCount }
 */
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  const session = sessionStore.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({
      error: 'Session not found'
    });
  }
  
  res.status(200).json({
    sessionId: session.id,
    messages: session.messages,
    createdAt: session.createdAt,
    lastAccessedAt: session.lastAccessedAt,
    messageCount: session.messages.length
  });
});

/**
 * Delete a session
 * DELETE /sessions/:sessionId
 * Response: { message: string }
 */
router.delete('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  const deleted = sessionStore.deleteSession(sessionId);
  
  if (!deleted) {
    return res.status(404).json({
      error: 'Session not found'
    });
  }
  
  res.status(200).json({
    message: 'Session deleted successfully'
  });
});

/**
 * Get all active sessions (for debugging/admin)
 * GET /sessions
 * Response: { sessions: Array, count: number }
 */
router.get('/', (req, res) => {
  const sessionIds = sessionStore.getAllSessionIds();
  const sessions = sessionIds.map(id => {
    const session = sessionStore.getSession(id);
    return {
      sessionId: id,
      messageCount: session.messages.length,
      createdAt: session.createdAt,
      lastAccessedAt: session.lastAccessedAt
    };
  });
  
  res.status(200).json({
    sessions,
    count: sessions.length
  });
});

/**
 * Clear conversation history for a session (keep session active)
 * POST /sessions/:sessionId/clear
 * Response: { message: string }
 */
router.post('/:sessionId/clear', (req, res) => {
  const { sessionId } = req.params;
  
  const session = sessionStore.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({
      error: 'Session not found'
    });
  }
  
  // Clear messages but keep session
  session.messages = [];
  
  res.status(200).json({
    message: 'Conversation history cleared'
  });
});

module.exports = router;
