import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import handlers
import apiHandler from './handlers/apiHandler.js';
import msgHandler from './handlers/msgHandler.js';
import { cleanupAllPolling } from './helpers/matchManager.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup with CORS configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Frontend domain
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// API Routes
app.use('/api', apiHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  // Initialize message handlers for this socket
  msgHandler.initializeHandlers(socket, io);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    msgHandler.handleDisconnection(socket, io);
  });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready for connections from http://localhost:3000`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n📟 Received ${signal}. Starting graceful shutdown...`);
  
  // Cleanup all polling intervals
  cleanupAllPolling();
  
  // Close server
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.log('⚠️ Force exit after 10 seconds');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app, server, io };
