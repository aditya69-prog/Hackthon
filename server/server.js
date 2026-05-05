require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const { requestLogger, errorLogger, log } = require('./middleware/logger');
const chatHandler = require('./socket/chatHandler');

const app = express();
const server = http.createServer(app);

// Parse CORS origins from environment
const getCorsOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()) || [];
  }
  return ['http://localhost:5173', 'http://localhost:3000'];
};

const corsOrigins = getCorsOrigins();

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Security Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Request Logging
app.use(requestLogger);

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Serve static files from client build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  
  // Serve index.html for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RNS Connect API is running! 🚀', env: process.env.NODE_ENV });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  errorLogger(err, req, res, next);
  console.error('Error:', err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  res.status(status).json({ error: message, ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) });
});

// Socket.io
chatHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  log(`RNS Connect Server running on port ${PORT}`);
  log(`API: http://localhost:${PORT}/api`);
  log(`WebSocket: ws://localhost:${PORT}`);
  log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
