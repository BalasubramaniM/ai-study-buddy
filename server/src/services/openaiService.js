const OpenAI = require('openai');
const config = require('../config/env');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

// System message for the AI assistant
const SYSTEM_MESSAGE = {
  role: 'system',
  content: 'You are a helpful AI study assistant. Help students understand concepts, answer questions, and provide educational guidance in a clear and encouraging manner.'
};

/**
 * Get chat completion from OpenAI with conversation history
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @returns {Promise<string>} - The assistant's reply
 */
async function getChatCompletion(userMessage, conversationHistory = []) {
  try {
    // Validate API key
    if (!config.OPENAI_API_KEY) {
      const error = new Error('OpenAI API key is not configured');
      error.statusCode = 500;
      throw error;
    }

    // Build messages array with conversation context
    // Format: [system, ...history, newUserMessage]
    const messages = [
      SYSTEM_MESSAGE,
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    console.log(`📨 Sending ${messages.length} messages to OpenAI (including system message)`);

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model: config.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    // Extract assistant's reply
    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      const error = new Error('No response received from OpenAI');
      error.statusCode = 500;
      throw error;
    }

    return reply;
  } catch (error) {
    console.error('OpenAI Service Error:', error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      const customError = new Error('Invalid OpenAI API key');
      customError.statusCode = 500;
      throw customError;
    }

    if (error.status === 429) {
      const customError = new Error('OpenAI rate limit exceeded. Please try again later.');
      customError.statusCode = 429;
      throw customError;
    }

    if (error.statusCode) {
      throw error;
    }

    // Generic error
    const customError = new Error('Failed to get response from AI service');
    customError.statusCode = 500;
    throw customError;
  }
}

module.exports = {
  getChatCompletion
};
