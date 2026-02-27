const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const healthRoute = require('./routes/health');
const chatRoute = require('./routes/chat');
const sessionsRoute = require('./routes/sessions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRoute);
app.use('/chat', chatRoute);
app.use('/sessions', sessionsRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 AI Study Buddy server running on port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});
