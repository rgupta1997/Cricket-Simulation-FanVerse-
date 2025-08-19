# Cricket Match Management System Documentation

## Overview

This enhanced backend now includes:
1. **Match Object Management** - Centralized tracking of active matches and users
2. **Automatic API Polling** - Real-time data fetching from Sportz.io API
3. **Local JSON Storage** - Match data saved locally for offline access

## 🏗️ Architecture

### Match Management Object Structure
```javascript
listenMatches = {
  "matchId": {
    users: [
      {
        userId: "socketId",
        socketId: "socketId", 
        joinedAt: "2025-08-19T...",
        username: "PlayerName",
        type: "player"
      }
    ],
    timeoutId: 12345,
    isPolling: true,
    lastUpdate: "2025-08-19T..."
  }
}
```

### File Structure
```
backend/
├── server.js                    # Main server with graceful shutdown
├── handlers/
│   ├── apiHandler.js            # Enhanced with match management APIs
│   └── msgHandler.js            # Updated with match polling integration
├── helpers/
│   ├── responseHelpers.js       # Pure helper functions
│   └── matchManager.js          # NEW: Match management & polling system
├── json/                        # NEW: Auto-created for storing match data
│   └── {matchId}.json          # Polled match data files
├── .env                         # Updated with API configuration
└── test-match-manager.html      # NEW: Comprehensive test interface
```

## 🔧 New Features

### 1. Match Object Management

**Auto-Creation**: When a user joins a match, the system:
- Creates match entry in `listenMatches` object
- Starts automatic polling for that match
- Tracks all users in the match

**Auto-Cleanup**: When the last user leaves:
- Stops polling for the match
- Removes match from `listenMatches` object
- Cleans up resources

### 2. API Polling System

**Base URL**: `https://demo.sportz.io/sifeeds/repo/cricket/live/json`
**Polling Interval**: 30 seconds (configurable via `.env`)

**Automatic Triggers**:
- Starts when first user joins a match
- Stops when last user leaves a match
- Runs continuously while users are connected

**Manual Triggers**:
- Socket event: `poll_match_data`
- API endpoint: `POST /api/match/{matchId}/poll`

### 3. Local JSON Storage

**Location**: `backend/json/` directory
**Format**: `{matchId}.json`

**File Structure**:
```json
{
  "matchId": "stbovl08182025256492",
  "lastUpdated": "2025-08-19T12:37:57.294Z",
  "apiUrl": "https://demo.sportz.io/sifeeds/repo/cricket/live/json/...",
  "data": {
    // Raw API response data
  }
}
```

## 📡 New API Endpoints

### GET `/api/matches`
Get current match management status
```json
{
  "success": true,
  "timestamp": "2025-08-19T...",
  "matches": {
    "matchId": {
      "userCount": 2,
      "isPolling": true,
      "lastUpdate": "2025-08-19T...",
      "users": [...]
    }
  }
}
```

### POST `/api/match/{matchId}/poll`
Manually trigger match data polling
```json
{
  "success": true,
  "matchId": "stbovl08182025256492",
  "message": "Match data polled successfully",
  "lastUpdated": "2025-08-19T...",
  "dataKeys": ["Timestamp", "Matchdetail", "Nuggets", ...]
}
```

### GET `/api/stats` (Enhanced)
Now includes both legacy and match manager statistics
```json
{
  "success": true,
  "server": { "status": "running", "uptime": 123.45 },
  "socket": {
    "legacy": {
      "totalConnections": 2,
      "activeMatches": 1,
      "matchDetails": [...]
    },
    "matchManager": {
      "matchId": {
        "userCount": 2,
        "isPolling": true,
        "lastUpdate": "2025-08-19T..."
      }
    }
  }
}
```

## 🔌 New Socket Events

### Client → Server

**`poll_match_data`** - Manually request data polling
```javascript
socket.emit('poll_match_data', { matchId: 'match123' });
```

**`get_match_status`** - Get current match management status
```javascript
socket.emit('get_match_status');
```

### Server → Client

**`match_data_updated`** - Data polling completed
```javascript
socket.on('match_data_updated', (data) => {
  // data: { matchId, lastUpdated, success }
});
```

**`match_status`** - Match management status response
```javascript
socket.on('match_status', (status) => {
  // status: Full match management object
});
```

## 🛠️ Configuration

### Environment Variables (.env)
```env
# API Polling Configuration
SPORTZ_API_BASE_URL=https://demo.sportz.io/sifeeds/repo/cricket/live/json
POLLING_INTERVAL=30000
```

### Match ID Format
- Use actual Sportz.io match IDs (e.g., `stbovl08182025256492`)
- Must be valid filename characters
- 3-50 characters, alphanumeric with dashes/underscores

## 🧪 Testing

### 1. Basic Test (test-socketio.html)
- Simple Socket.IO connection testing
- Basic message broadcasting

### 2. Advanced Test (test-match-manager.html)
- Complete match management testing
- API polling verification
- Real-time data updates
- Server statistics monitoring

### 3. Manual API Testing
```bash
# Get match management status
curl http://localhost:3001/api/matches

# Manually poll a match
curl -X POST http://localhost:3001/api/match/stbovl08182025256492/poll

# Check server stats
curl http://localhost:3001/api/stats
```

## 🔄 Data Flow

1. **User Joins Match**:
   ```
   Frontend → join_match → Match Manager → Start Polling → API → JSON File
   ```

2. **Automatic Polling**:
   ```
   Timer → API Poll → JSON Save → Continue (every 30s)
   ```

3. **User Leaves Match**:
   ```
   Disconnect → Remove User → Check Empty → Stop Polling → Cleanup
   ```

4. **Manual Polling**:
   ```
   Frontend/API → Force Poll → API → JSON Save → Notify Users
   ```

## 🚨 Error Handling

- **API Failures**: Creates `{matchId}_error.json` files
- **Network Issues**: Continues polling, logs errors
- **Invalid Match IDs**: Validates before processing
- **Graceful Shutdown**: Cleans up all polling intervals

## 📊 Monitoring

- Real-time user tracking per match
- Polling status monitoring
- API response time tracking
- Automatic cleanup verification

## 🎯 Usage Examples

### Frontend Integration
```javascript
// Join match (automatically starts polling)
socket.emit('join_match', { 
  matchId: 'stbovl08182025256492', 
  username: 'Player1' 
});

// Listen for data updates
socket.on('match_data_updated', (data) => {
  console.log('Match data updated:', data);
  // Refresh your UI with new data
});

// Manually trigger polling
socket.emit('poll_match_data', { 
  matchId: 'stbovl08182025256492' 
});
```

### Backend Integration
```javascript
import { addUserToMatch, forcePollMatch } from './helpers/matchManager.js';

// Add user programmatically
addUserToMatch('match123', 'user456', 'socket789', { type: 'spectator' });

// Force polling
const result = await forcePollMatch('match123');
```

The system is now ready for production use with automatic match data synchronization! 🏏
