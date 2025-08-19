const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000,
    lazyConnect: true
  }
});

// Redis connection
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

// Chat Routes
app.get('/api/chat/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    // Get chat history from Redis
    const chatKey = `chat:${userId}`;
    const messages = await redisClient.lRange(chatKey, 0, limit - 1);
    
    // Parse messages and format them
    const formattedMessages = messages
      .map(msg => JSON.parse(msg))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      success: true,
      data: formattedMessages,
      count: formattedMessages.length
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
});

app.post('/api/chat/message', async (req, res) => {
  try {
    const { userId, message, type = 'user', metadata = {} } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId and message are required'
      });
    }
    
    const messageData = {
      id: uuidv4(),
      userId,
      message,
      type, // 'user' or 'agent'
      timestamp: moment().toISOString(),
      metadata,
      read: false
    };
    
    // Save to Redis
    const chatKey = `chat:${userId}`;
    await redisClient.lPush(chatKey, JSON.stringify(messageData));
    
    // Set expiration for chat history (30 days)
    await redisClient.expire(chatKey, 30 * 24 * 60 * 60);
    
    // Store message in global messages for search
    const messageKey = `message:${messageData.id}`;
    await redisClient.setEx(messageKey, 30 * 24 * 60 * 60, JSON.stringify(messageData));
    
    res.json({
      success: true,
      data: messageData
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save message'
    });
  }
});

app.get('/api/chat/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chatKey = `chat:${userId}`;
    
    const totalMessages = await redisClient.lLen(chatKey);
    const messages = await redisClient.lRange(chatKey, 0, -1);
    
    const userMessages = messages.filter(msg => {
      const parsed = JSON.parse(msg);
      return parsed.type === 'user';
    }).length;
    
    const agentMessages = totalMessages - userMessages;
    
    res.json({
      success: true,
      data: {
        totalMessages,
        userMessages,
        agentMessages,
        lastActivity: messages.length > 0 ? JSON.parse(messages[0]).timestamp : null
      }
    });
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat stats'
    });
  }
});

app.put('/api/chat/read/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { messageIds } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        error: 'messageIds array is required'
      });
    }
    
    const chatKey = `chat:${userId}`;
    const messages = await redisClient.lRange(chatKey, 0, -1);
    
    // Mark messages as read
    for (const msgStr of messages) {
      const msg = JSON.parse(msgStr);
      if (messageIds.includes(msg.id)) {
        msg.read = true;
        // Update the message in Redis
        await redisClient.lSet(chatKey, messages.indexOf(msgStr), JSON.stringify(msg));
      }
    }
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read'
    });
  }
});

app.get('/api/chat/search/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { q: query, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const chatKey = `chat:${userId}`;
    const messages = await redisClient.lRange(chatKey, 0, -1);
    
    // Simple text search
    const searchResults = messages
      .map(msg => JSON.parse(msg))
      .filter(msg => 
        msg.message.toLowerCase().includes(query.toLowerCase()) ||
        (msg.metadata && JSON.stringify(msg.metadata).toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, limit);
    
    res.json({
      success: true,
      data: searchResults,
      count: searchResults.length,
      query
    });
  } catch (error) {
    console.error('Error searching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search chat history'
    });
  }
});

app.get('/api/chat/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chatKey = `chat:${userId}`;
    const messages = await redisClient.lRange(chatKey, 0, -1);
    
    const unreadCount = messages.filter(msg => {
      const parsed = JSON.parse(msg);
      return !parsed.read && parsed.type === 'agent';
    }).length;
    
    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count'
    });
  }
});

app.delete('/api/chat/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chatKey = `chat:${userId}`;
    
    await redisClient.del(chatKey);
    
    res.json({
      success: true,
      message: 'Chat history deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat history'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Cricket Chat API is running',
    timestamp: moment().toISOString(),
    redis: redisClient.isReady ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cricket Chat API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🏏 Chat API: http://localhost:${PORT}/api/chat`);
});
