# 🏏 Cricket Chatbot Setup Guide

Complete guide to integrate a floating chatbot into your Cricket Simulation FanVerse application.

## 🎯 What We're Building

A **Facebook-style floating chat widget** that:
- ✅ Floats at the bottom-right corner
- ✅ Integrates with Chatwoot (free, open-source)
- ✅ Stores chat history in Redis
- ✅ Matches your cricket theme
- ✅ No WebSocket required (HTTP-based)
- ✅ Mobile responsive

## 🚀 Quick Start (Windows)

1. **Run the setup script:**
   ```bash
   setup-chatbot.bat
   ```

2. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

3. **Chatbot will appear automatically!**

## 🛠️ Manual Setup

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Start Redis

**Option A: Docker (Recommended)**
```bash
docker-compose up -d redis
```

**Option B: Windows WSL**
```bash
wsl
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```

**Option C: Windows with Redis for Windows**
Download from: https://github.com/microsoftarchive/redis/releases

### Step 3: Configure Environment

Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

### Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

### Step 5: Verify Installation

- Backend: http://localhost:3001/api/health
- Redis: Check if Redis is running on port 6379

## 🔧 Chatwoot Configuration

### Get Your Chatwoot Token

1. **Sign up at:** https://app.chatwoot.com
2. **Create a new inbox**
3. **Get your website token**
4. **Update the component:**

```jsx
// In ChatwootChatbot.jsx, line 25
websiteToken: 'YOUR_ACTUAL_TOKEN_HERE',
baseUrl: 'https://app.chatwoot.com', // or your self-hosted instance
```

### Self-Host Chatwoot (Optional)

If you want to host Chatwoot yourself:

```bash
# Clone Chatwoot
git clone https://github.com/chatwoot/chatwoot.git
cd chatwoot

# Setup and run
docker-compose up -d
```

Then update the `baseUrl` in your component.

## 🎨 Customization

### Change Chatbot Position

```css
/* In ChatwootChatbot.css */
.custom-chat-button {
  position: fixed;
  bottom: 20px;  /* Change this */
  right: 20px;   /* Change this */
}
```

### Change Colors

```css
/* Cricket theme colors */
.custom-chat-button {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
}

/* Change to your preferred colors */
.custom-chat-button {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

### Change Chatbot Icon

```jsx
// In ChatwootChatbot.jsx
<div className="chat-icon">🏏</div>  {/* Change emoji */}
```

## 📱 Mobile Responsiveness

The chatbot automatically adapts to mobile screens:

- **Desktop**: 60x60px button
- **Tablet**: 55x55px button  
- **Mobile**: 50x50px button

## 🔍 Testing Your Chatbot

### Test Chat History API

```bash
# Save a message
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"userId": "test123", "message": "Hello Cricket!", "type": "user"}'

# Get chat history
curl http://localhost:3001/api/chat/history/test123

# Get unread count
curl http://localhost:3001/api/chat/unread/test123
```

### Test Frontend Integration

1. Open http://localhost:5173
2. Look for the floating chat button (bottom-right)
3. Click to open the chat widget
4. Send a test message

## 🚨 Troubleshooting

### Chatbot Not Appearing

1. **Check browser console** for JavaScript errors
2. **Verify Chatwoot token** is correct
3. **Check if Chatwoot script** is loading
4. **Verify component is imported** in WebApp.jsx

### Backend Connection Issues

1. **Check if backend is running** on port 3001
2. **Verify Redis is running** on port 6379
3. **Check CORS settings** in backend/.env
4. **Test health endpoint:** http://localhost:3001/api/health

### Redis Connection Issues

1. **Check Docker containers:**
   ```bash
   docker ps
   docker logs cricket-chat-redis
   ```

2. **Test Redis connection:**
   ```bash
   redis-cli ping
   ```

3. **Check Redis port:**
   ```bash
   netstat -an | findstr :6379
   ```

## 📊 Monitoring & Analytics

### Redis Commander (Optional)

Start Redis Commander for web-based Redis management:

```bash
docker-compose --profile tools up -d redis-commander
```

Access at: http://localhost:8081

### Health Monitoring

- **Backend Health:** http://localhost:3001/api/health
- **Redis Status:** Included in health endpoint
- **API Metrics:** Built-in rate limiting monitoring

## 🔒 Security Features

- **Rate Limiting:** 100 requests per 15 minutes per IP
- **CORS Protection:** Only allows configured frontend domains
- **Input Validation:** Sanitizes all incoming data
- **Helmet.js:** Security headers
- **Redis Authentication:** Supports password protection

## 📈 Performance Optimization

- **Redis Connection Pooling:** Efficient connections
- **Message Expiration:** Automatic cleanup after 30 days
- **Lazy Loading:** Chat history loaded on demand
- **Compression:** Built-in response compression

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
REDIS_URL=redis://your-redis-host:6379
REDIS_PASSWORD=your-redis-password
```

### PM2 Process Manager

```bash
npm install -g pm2
pm2 start backend/server.js --name "cricket-chat"
pm2 startup
pm2 save
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🤝 Support & Community

- **Chatwoot Documentation:** https://www.chatwoot.com/docs
- **Redis Documentation:** https://redis.io/documentation
- **Node.js Best Practices:** https://nodejs.org/en/docs/guides/
- **Cricket Simulation Issues:** Create an issue in this repository

## 📝 API Reference

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/history/:userId` | Get user's chat history |
| POST | `/api/chat/message` | Save a new message |
| GET | `/api/chat/stats/:userId` | Get chat statistics |
| PUT | `/api/chat/read/:userId` | Mark messages as read |
| GET | `/api/chat/search/:userId` | Search chat history |
| GET | `/api/chat/unread/:userId` | Get unread count |
| DELETE | `/api/chat/history/:userId` | Delete chat history |

### Message Format

```json
{
  "id": "uuid-v4",
  "userId": "user123",
  "message": "Hello Cricket!",
  "type": "user",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "metadata": {},
  "read": false
}
```

## 🎉 You're All Set!

Your Cricket Simulation now has a professional floating chatbot that:
- 🏏 Matches your cricket theme
- 💬 Provides excellent user support
- 📱 Works on all devices
- 🚀 Scales with Redis
- 🔒 Is secure and reliable

Happy chatting! 🏏💬
