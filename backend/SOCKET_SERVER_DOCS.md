# Cricket Simulation Backend - Socket.IO Server

## Overview
Express.js server with Socket.IO for real-time cricket match communication.

## Architecture

### Server Structure
```
backend/
├── server.js                 # Main server file
├── handlers/
│   ├── apiHandler.js         # API route handlers (pure functions)
│   └── msgHandler.js         # Socket.IO message handlers
├── helpers/
│   └── responseHelpers.js    # Helper functions (pure functions)
└── .env                      # Environment configuration
```

### API Endpoints

#### GET `/api/ping`
Health check endpoint that returns server status.
```json
{
  "message": "pong",
  "timestamp": "2025-08-19T...",
  "server": "Cricket Simulation Backend",
  "status": "healthy",
  "uptime": 123.45
}
```

#### GET `/api/stats`
Get server and socket statistics.
```json
{
  "success": true,
  "server": {
    "status": "running",
    "timestamp": "2025-08-19T...",
    "uptime": 123.45
  },
  "socket": {
    "totalConnections": 5,
    "activeMatches": 2,
    "matchDetails": [
      {"matchId": "match123", "connectedUsers": 3},
      {"matchId": "match456", "connectedUsers": 2}
    ]
  }
}
```

#### POST `/api/match`
Create a new match room.
```json
// Request body
{
  "matchId": "match123",
  "matchName": "Test Match"
}

// Response
{
  "success": true,
  "matchId": "match123",
  "matchName": "Test Match",
  "timestamp": "2025-08-19T...",
  "message": "Match room created successfully"
}
```

#### GET `/api/match/:matchId`
Get match information.
```json
{
  "success": true,
  "matchId": "match123",
  "status": "active",
  "timestamp": "2025-08-19T...",
  "connectedClients": 3
}
```

### Socket.IO Events

#### Client to Server Events

**`join_match`** - Join a match room
```javascript
socket.emit('join_match', {
  matchId: 'match123',
  username: 'JohnDoe'
});
```

**`send_message`** - Send a message to match room
```javascript
socket.emit('send_message', {
  message: 'Great shot!'
});
```

**`match_event`** - Send custom match events
```javascript
socket.emit('match_event', {
  eventType: 'wicket',
  eventData: { batsman: 'Player1', bowler: 'Player2' }
});
```

**`get_room_info`** - Get current room information
```javascript
socket.emit('get_room_info');
```

#### Server to Client Events

**`joined_match`** - Confirmation of joining match
```javascript
socket.on('joined_match', (data) => {
  // data: { matchId, username, timestamp, connectedUsers }
});
```

**`new_message`** - Receive new message
```javascript
socket.on('new_message', (message) => {
  // message: { id, socketId, matchId, username, message, timestamp, type }
});
```

**`message_sent`** - Confirmation message was sent
```javascript
socket.on('message_sent', (data) => {
  // data: { messageId, timestamp }
});
```

**`system_notification`** - System notifications
```javascript
socket.on('system_notification', (notification) => {
  // notification: { id, matchId, message, timestamp, type, isSystem }
});
```

**`match_event_received`** - Receive custom match events
```javascript
socket.on('match_event_received', (event) => {
  // event: { eventType, eventData, matchId, username, timestamp, socketId }
});
```

**`room_info`** - Room information response
```javascript
socket.on('room_info', (info) => {
  // info: { connected, matchId, username, connectedUsers, joinedAt }
});
```

**`error`** - Error notifications
```javascript
socket.on('error', (error) => {
  // error: { message, code }
});
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server runs on port 3001 by default, configured to accept connections from localhost:3000.

## Features

- ✅ Express.js REST API with rate limiting
- ✅ Socket.IO real-time communication
- ✅ Match room system with join/leave functionality
- ✅ Message broadcasting to room members (excluding sender)
- ✅ Pure function architecture for handlers and helpers
- ✅ Input validation and sanitization
- ✅ Error handling and logging
- ✅ CORS configuration for frontend integration
- ✅ Environment variable configuration
