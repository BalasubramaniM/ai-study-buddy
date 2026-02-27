const crypto = require('crypto');

/**
 * In-memory session store
 * Structure: Map<sessionId, Session>
 * Session: { id, messages: [], createdAt, lastAccessedAt }
 */
class SessionStore {
  constructor() {
    this.sessions = new Map();
    this.MAX_MESSAGES_PER_SESSION = 20; // Limit to last 20 messages (10 exchanges)
    this.SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
  }

  /**
   * Create a new session
   * @returns {string} - Session ID
   */
  createSession() {
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      messages: [],
      createdAt: new Date(),
      lastAccessedAt: new Date()
    };
    
    this.sessions.set(sessionId, session);
    console.log(`✅ Session created: ${sessionId}`);
    
    return sessionId;
  }

  /**
   * Get session by ID
   * @param {string} sessionId - Session ID
   * @returns {Object|null} - Session object or null if not found
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Update last accessed time
    session.lastAccessedAt = new Date();
    
    return session;
  }

  /**
   * Add message to session
   * @param {string} sessionId - Session ID
   * @param {string} role - Message role ('user' or 'assistant')
   * @param {string} content - Message content
   */
  addMessage(sessionId, role, content) {
    const session = this.getSession(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Add message to history
    session.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    // Limit message history to prevent token overflow
    // Keep system message + last N messages
    if (session.messages.length > this.MAX_MESSAGES_PER_SESSION) {
      // Remove oldest messages (keep most recent ones)
      session.messages = session.messages.slice(-this.MAX_MESSAGES_PER_SESSION);
    }

    console.log(`📝 Message added to session ${sessionId}: ${role}`);
  }

  /**
   * Get conversation history for a session
   * @param {string} sessionId - Session ID
   * @returns {Array} - Array of messages
   */
  getHistory(sessionId) {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return [];
    }

    return session.messages;
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   * @returns {boolean} - True if deleted, false if not found
   */
  deleteSession(sessionId) {
    const deleted = this.sessions.delete(sessionId);
    
    if (deleted) {
      console.log(`🗑️  Session deleted: ${sessionId}`);
    }
    
    return deleted;
  }

  /**
   * Check if session exists
   * @param {string} sessionId - Session ID
   * @returns {boolean}
   */
  hasSession(sessionId) {
    return this.sessions.has(sessionId);
  }

  /**
   * Get all active session IDs
   * @returns {Array<string>}
   */
  getAllSessionIds() {
    return Array.from(this.sessions.keys());
  }

  /**
   * Get session count
   * @returns {number}
   */
  getSessionCount() {
    return this.sessions.size;
  }

  /**
   * Clean up expired sessions
   * Called periodically to remove inactive sessions
   */
  cleanupExpiredSessions() {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastAccess = now - session.lastAccessedAt;
      
      if (timeSinceLastAccess > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired session(s)`);
    }

    return cleanedCount;
  }

  /**
   * Clear all sessions (useful for testing/reset)
   */
  clearAll() {
    const count = this.sessions.size;
    this.sessions.clear();
    console.log(`🗑️  Cleared all ${count} session(s)`);
  }
}

// Create singleton instance
const sessionStore = new SessionStore();

// Run cleanup every 10 minutes
setInterval(() => {
  sessionStore.cleanupExpiredSessions();
}, 10 * 60 * 1000);

module.exports = sessionStore;
