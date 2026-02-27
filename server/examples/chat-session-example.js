/**
 * Example usage of the session-based chat API
 * Run with: node examples/chat-session-example.js
 */

const API_BASE_URL = 'http://localhost:3001';

/**
 * Example 1: Basic chat without explicit session creation
 * The server will auto-create a session
 */
async function example1_AutoSession() {
  console.log('\n=== Example 1: Auto-created Session ===\n');

  // First message - no sessionId provided
  const response1 = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What is machine learning?'
    })
  });
  const data1 = await response1.json();
  console.log('User: What is machine learning?');
  console.log('AI:', data1.reply);
  console.log('Session ID:', data1.sessionId);

  // Second message - use the session ID from first response
  const response2 = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Can you give me an example?',
      sessionId: data1.sessionId
    })
  });
  const data2 = await response2.json();
  console.log('\nUser: Can you give me an example?');
  console.log('AI:', data2.reply);
  console.log('(AI remembers the previous context!)');

  return data1.sessionId;
}

/**
 * Example 2: Explicit session creation
 */
async function example2_ExplicitSession() {
  console.log('\n=== Example 2: Explicit Session Creation ===\n');

  // Create session first
  const sessionResponse = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST'
  });
  const { sessionId } = await sessionResponse.json();
  console.log('Created session:', sessionId);

  // Use the session for chat
  const chatResponse = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Explain quantum computing',
      sessionId: sessionId
    })
  });
  const chatData = await chatResponse.json();
  console.log('\nUser: Explain quantum computing');
  console.log('AI:', chatData.reply);

  return sessionId;
}

/**
 * Example 3: Retrieve conversation history
 */
async function example3_GetHistory(sessionId) {
  console.log('\n=== Example 3: Retrieve Conversation History ===\n');

  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
  const session = await response.json();

  console.log(`Session: ${session.sessionId}`);
  console.log(`Messages: ${session.messageCount}`);
  console.log(`Created: ${session.createdAt}`);
  console.log('\nConversation:');
  console.log('---');

  session.messages.forEach((msg, index) => {
    const speaker = msg.role === 'user' ? 'User' : 'AI';
    console.log(`\n${speaker}: ${msg.content}`);
  });
}

/**
 * Example 4: Clear conversation history
 */
async function example4_ClearHistory(sessionId) {
  console.log('\n=== Example 4: Clear Conversation History ===\n');

  // Clear the history
  await fetch(`${API_BASE_URL}/sessions/${sessionId}/clear`, {
    method: 'POST'
  });
  console.log('Conversation history cleared');

  // Send new message - no previous context
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What were we talking about?',
      sessionId: sessionId
    })
  });
  const data = await response.json();
  console.log('\nUser: What were we talking about?');
  console.log('AI:', data.reply);
  console.log('(AI has no memory of previous conversation)');
}

/**
 * Example 5: List all active sessions
 */
async function example5_ListSessions() {
  console.log('\n=== Example 5: List All Sessions ===\n');

  const response = await fetch(`${API_BASE_URL}/sessions`);
  const data = await response.json();

  console.log(`Total active sessions: ${data.count}\n`);
  data.sessions.forEach((session, index) => {
    console.log(`${index + 1}. Session: ${session.sessionId}`);
    console.log(`   Messages: ${session.messageCount}`);
    console.log(`   Created: ${session.createdAt}`);
    console.log(`   Last accessed: ${session.lastAccessedAt}\n`);
  });
}

/**
 * Example 6: Delete a session
 */
async function example6_DeleteSession(sessionId) {
  console.log('\n=== Example 6: Delete Session ===\n');

  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'DELETE'
  });
  const data = await response.json();

  console.log(data.message);
  console.log(`Session ${sessionId} has been removed`);
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    console.log('🚀 AI Study Buddy - Session-Based Chat Examples');
    console.log('================================================');

    // Example 1: Auto-created session
    const sessionId1 = await example1_AutoSession();

    // Wait a bit for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 2: Explicit session creation
    const sessionId2 = await example2_ExplicitSession();

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 3: Get history
    await example3_GetHistory(sessionId1);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 4: Clear history
    await example4_ClearHistory(sessionId2);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 5: List all sessions
    await example5_ListSessions();

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 6: Delete sessions
    await example6_DeleteSession(sessionId1);
    await example6_DeleteSession(sessionId2);

    console.log('\n✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure the server is running on http://localhost:3001');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  example1_AutoSession,
  example2_ExplicitSession,
  example3_GetHistory,
  example4_ClearHistory,
  example5_ListSessions,
  example6_DeleteSession
};
