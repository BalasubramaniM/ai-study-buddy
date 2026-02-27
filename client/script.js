/**
 * AI Study Buddy - Chat Application
 * Session-based chat interface with conversation memory
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = 'http://localhost:3001';
const CHAT_ENDPOINT = `${API_BASE_URL}/chat`;
const SESSION_STORAGE_KEY = 'aiStudyBuddy_sessionId';

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const submitBtn = document.getElementById('submitBtn');
const chatContainer = document.getElementById('chatContainer');
const messagesContainer = document.getElementById('messagesContainer');
const welcomeMessage = document.getElementById('welcomeMessage');
const typingIndicator = document.getElementById('typingIndicator');
const errorBanner = document.getElementById('errorBanner');
const errorText = document.getElementById('errorText');
const closeErrorBtn = document.getElementById('closeErrorBtn');
const newChatBtn = document.getElementById('newChatBtn');
const sessionDisplay = document.getElementById('sessionDisplay');

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let currentSessionId = null;

/**
 * Get or create a session ID
 * Session ID is stored in localStorage for persistence across page reloads
 */
function initializeSession() {
  // Try to get existing session from localStorage
  const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  
  if (storedSessionId) {
    currentSessionId = storedSessionId;
    console.log('💾 Restored session from localStorage:', currentSessionId);
  } else {
    // Generate new session ID
    currentSessionId = generateSessionId();
    localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId);
    console.log('🆕 Created new session:', currentSessionId);
  }
  
  // Update UI with session ID (show first 8 characters)
  updateSessionDisplay();
}

/**
 * Generate a unique session ID (UUID v4)
 */
function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Start a new chat session
 */
function startNewChat() {
  // Confirm if there are messages
  if (messagesContainer.children.length > 0) {
    const confirmed = confirm('Start a new conversation? This will clear the current chat.');
    if (!confirmed) return;
  }
  
  // Generate new session
  currentSessionId = generateSessionId();
  localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId);
  
  // Clear chat UI
  messagesContainer.innerHTML = '';
  welcomeMessage.classList.remove('hidden');
  
  // Update session display
  updateSessionDisplay();
  
  // Focus input
  messageInput.focus();
  
  console.log('🔄 Started new chat session:', currentSessionId);
}

/**
 * Update session display in UI
 */
function updateSessionDisplay() {
  // Show first 8 characters of session ID
  const shortId = currentSessionId.substring(0, 8);
  sessionDisplay.textContent = shortId;
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Add a message to the chat interface
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message content
 */
function addMessage(role, content) {
  // Hide welcome message on first message
  if (welcomeMessage && !welcomeMessage.classList.contains('hidden')) {
    welcomeMessage.classList.add('hidden');
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'flex message-bubble';
  
  if (role === 'user') {
    // User message - aligned right
    messageDiv.classList.add('justify-end');
    messageDiv.innerHTML = `
      <div class="flex items-start space-x-3 flex-row-reverse space-x-reverse max-w-xs md:max-w-md">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
          You
        </div>
        <div class="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3">
          <p class="text-sm md:text-base whitespace-pre-wrap break-words">${escapeHtml(content)}</p>
        </div>
      </div>
    `;
  } else {
    // Assistant message - aligned left
    messageDiv.classList.add('justify-start');
    messageDiv.innerHTML = `
      <div class="flex items-start space-x-3 max-w-xs md:max-w-md lg:max-w-lg">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span class="text-sm">🤖</span>
        </div>
        <div class="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
          <p class="text-sm md:text-base text-gray-800 whitespace-pre-wrap break-words">${escapeHtml(content)}</p>
        </div>
      </div>
    `;
  }
  
  messagesContainer.appendChild(messageDiv);
  
  // Auto-scroll to the latest message
  scrollToBottom();
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Scroll chat container to bottom
 */
function scrollToBottom() {
  // Use setTimeout to ensure DOM has updated
  setTimeout(() => {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: 'smooth'
    });
  }, 100);
}

// ============================================================================
// API COMMUNICATION
// ============================================================================

/**
 * Send message to backend API
 * @param {string} message - User's message
 */
async function sendMessage(message) {
  try {
    // Show typing indicator
    showTypingIndicator();
    
    // Make POST request with sessionId
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        sessionId: currentSessionId
      })
    });
    
    const data = await response.json();
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Check if request was successful
    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    
    // Update session ID if backend returned a new one
    if (data.sessionId && data.sessionId !== currentSessionId) {
      currentSessionId = data.sessionId;
      localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId);
      updateSessionDisplay();
    }
    
    // Check if reply exists
    if (!data.reply) {
      throw new Error('No response received from AI');
    }
    
    // Add assistant's reply to chat
    addMessage('assistant', data.reply);
    
  } catch (error) {
    hideTypingIndicator();
    console.error('Error sending message:', error);
    
    // Show user-friendly error message
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showError('Unable to connect to server. Make sure the backend is running on port 3001.');
    } else {
      showError(error.message || 'Failed to send message. Please try again.');
    }
  }
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

/**
 * Show typing indicator
 */
function showTypingIndicator() {
  typingIndicator.classList.remove('hidden');
  submitBtn.disabled = true;
  messageInput.disabled = true;
  scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  typingIndicator.classList.add('hidden');
  submitBtn.disabled = false;
  messageInput.disabled = false;
  messageInput.focus();
}

/**
 * Show error banner
 * @param {string} message - Error message to display
 */
function showError(message) {
  errorText.textContent = message;
  errorBanner.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideError();
  }, 5000);
}

/**
 * Hide error banner
 */
function hideError() {
  errorBanner.classList.add('hidden');
  errorText.textContent = '';
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  
  // Get and validate user message
  const message = messageInput.value.trim();
  
  if (!message) {
    showError('Please enter a message');
    return;
  }
  
  // Add user message to chat immediately
  addMessage('user', message);
  
  // Clear input field
  messageInput.value = '';
  
  // Adjust textarea height back to original
  messageInput.style.height = 'auto';
  
  // Send message to backend
  await sendMessage(message);
}

/**
 * Handle "New Chat" button click
 */
function handleNewChat() {
  startNewChat();
}

/**
 * Handle close error button click
 */
function handleCloseError() {
  hideError();
}

/**
 * Auto-resize textarea as user types
 */
function handleTextareaInput() {
  // Reset height to auto to get the correct scrollHeight
  messageInput.style.height = 'auto';
  
  // Set height to scrollHeight (max 150px)
  const newHeight = Math.min(messageInput.scrollHeight, 150);
  messageInput.style.height = `${newHeight}px`;
}

/**
 * Handle Enter key press (submit on Enter, new line on Shift+Enter)
 */
function handleKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application
 */
function init() {
  console.log('🚀 AI Study Buddy initialized');
  
  // Initialize session management
  initializeSession();
  
  // Attach event listeners
  chatForm.addEventListener('submit', handleFormSubmit);
  newChatBtn.addEventListener('click', handleNewChat);
  closeErrorBtn.addEventListener('click', handleCloseError);
  messageInput.addEventListener('input', handleTextareaInput);
  messageInput.addEventListener('keypress', handleKeyPress);
  
  // Focus on input field
  messageInput.focus();
  
  console.log('✅ Ready to chat!');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
