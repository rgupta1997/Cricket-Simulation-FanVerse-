# 🏏 Cricket Chat Backend

Redis-based chat history backend for Cricket Simulation FanVerse.

## 🚀 Features

- **Real-time Chat History**: Store and retrieve chat messages
- **Redis Integration**: Fast, scalable message storage
- **User Management**: Track individual user conversations
- **Search & Analytics**: Search through chat history and get statistics
- **Rate Limiting**: Protect against abuse
- **CORS Support**: Frontend integration ready

## 📋 Prerequisites

- Node.js (v16 or higher)
- Redis Server (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:5173
   
   # Redis Configuration
   REDIS_URL=redis://localhost:6379
   
   # Optional: Redis Password (if required)
   # REDIS_PASSWORD=your_redis_password
   
   # Optional: Redis Database Number
   # REDIS_DB=0
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Security
   HELMET_ENABLED=true
   CORS_ENABLED=true
   ```

3. **Start Redis Server**
   ```bash
   # On Windows (if using WSL or Docker)
   redis-server
   
   # On macOS
   brew services start redis
   
   # On Linux
   sudo systemctl start redis
   
   # Using Docker
   docker run -d -p 6379:6379 redis:alpine
   ```

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server status and Redis connection

### Chat Operations
- `GET /api/chat/history/:userId` - Get user's chat history
- `POST /api/chat/message` - Save a new message
- `GET /api/chat/stats/:userId` - Get user's chat statistics
- `PUT /api/chat/read/:userId` - Mark messages as read
- `GET /api/chat/search/:userId` - Search chat history
- `GET /api/chat/unread/:userId` - Get unread message count
- `DELETE /api/chat/history/:userId` - Delete user's chat history

## 🔧 Configuration

### Redis Connection
- **Local Redis**: `redis://localhost:6379`
- **Redis Cloud**: `redis://username:password@host:port`
- **Docker**: `redis://localhost:6379`

### CORS
- Configure `FRONTEND_URL` in `.env` to allow your frontend domain
- Supports multiple origins with comma separation

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

## 🧪 Testing

Test the API endpoints using curl or Postman:

```bash
# Health check
curl http://localhost:3001/api/health

# Save a message
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "message": "Hello Cricket!", "type": "user"}'

# Get chat history
curl http://localhost:3001/api/chat/history/user123
```

## 📊 Redis Data Structure

### Chat History
- **Key**: `chat:{userId}`
- **Type**: List
- **Expiration**: 30 days
- **Format**: JSON string with message data

### Individual Messages
- **Key**: `message:{messageId}`
- **Type**: String
- **Expiration**: 30 days
- **Format**: JSON string with complete message data

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: DDoS protection
- **Input Validation**: Request sanitization
- **Error Handling**: Secure error responses

## 🚨 Troubleshooting

### Redis Connection Issues
1. Check if Redis server is running
2. Verify Redis URL in `.env`
3. Check firewall settings
4. Ensure Redis port (6379) is accessible

### CORS Errors
1. Verify `FRONTEND_URL` in `.env`
2. Check if frontend is running on correct port
3. Ensure backend is accessible from frontend

### Port Conflicts
1. Change `PORT` in `.env` if 3001 is occupied
2. Update frontend configuration accordingly

## 📈 Performance

- **Redis**: Sub-millisecond response times
- **Connection Pooling**: Efficient Redis connections
- **Rate Limiting**: Prevents abuse
- **Error Handling**: Graceful degradation

## 🔄 Updates & Maintenance

- **Message Expiration**: Automatic cleanup after 30 days
- **Health Monitoring**: Built-in health check endpoint
- **Graceful Shutdown**: Proper cleanup on server stop
- **Logging**: Comprehensive error and connection logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
