import { 
  isValidMatchId, 
  generateRoomId, 
  createMessageObject, 
  createSystemNotification 
} from '../helpers/responseHelpers.js';

import {
  addUserToMatch,
  removeUserFromMatch,
  getUsersInMatch,
  getListeningMatchesStatus,
  forcePollMatch,
  getLatestBallEvent,
  forcePollCommentary
} from '../helpers/matchManager.js';

// In-memory store for connected clients (legacy - now using matchManager)
const connectedClients = new Map(); // socketId -> { matchId, username, joinedAt }
const matchRooms = new Map(); // matchId -> Set of socketIds (legacy - keeping for backward compatibility)

/**
 * Initialize Socket.IO event handlers for a connected socket
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} io - Socket.IO server instance
 */
const initializeHandlers = (socket, io) => {
  
  // Handle joining a match room with user type
  socket.on('join_match', (data) => {
    try {
      const { matchId, username, userType = 'generic' } = data;
      
      if (!isValidMatchId(matchId)) {
        socket.emit('error', {
          message: 'Invalid match ID format',
          code: 'INVALID_MATCH_ID'
        });
        return;
      }

      const roomId = generateRoomId(matchId);
      
      // Leave any previous room
      leaveCurrentRoom(socket);
      
      // Join the new room
      socket.join(roomId);
      
      // Store client information (legacy system)
      connectedClients.set(socket.id, {
        matchId,
        username: username || 'Anonymous',
        userType,
        joinedAt: new Date().toISOString(),
        roomId
      });
      
      // Add user to new match management system with io instance
      addUserToMatch(matchId, socket.id, socket.id, {
        username: username || 'Anonymous',
        userType
      }, io);
      
      // Update match room tracking (legacy)
      if (!matchRooms.has(matchId)) {
        matchRooms.set(matchId, new Set());
      }
      matchRooms.get(matchId).add(socket.id);
      
      // Get current users from match manager
      const currentUsers = getUsersInMatch(matchId);
      
      console.log(`Socket ${socket.id} joined match ${matchId} as ${username} (Type: ${userType})`);
      
      // Notify client of successful join
      socket.emit('joined_match', {
        matchId,
        username: username || 'Anonymous',
        userType,
        timestamp: new Date().toISOString(),
        connectedUsers: currentUsers.length
      });
      
      // Notify other users in the room
      const systemNotification = createSystemNotification(
        matchId,
        `${username || 'Anonymous'} joined the match as ${userType}`,
        'user_joined'
      );
      
      socket.to(roomId).emit('system_notification', systemNotification);
      
    } catch (error) {
      console.error('Error in join_match:', error);
      socket.emit('error', {
        message: 'Failed to join match',
        code: 'JOIN_MATCH_ERROR'
      });
    }
  });

  // Handle sending messages (chat users)
  socket.on('send_message', (data) => {
    try {
      const { message } = data;
      const clientInfo = connectedClients.get(socket.id);
      
      if (!clientInfo) {
        socket.emit('error', {
          message: 'You must join a match first',
          code: 'NOT_IN_MATCH'
        });
        return;
      }
      
      if (!message || message.trim().length === 0) {
        socket.emit('error', {
          message: 'Message cannot be empty',
          code: 'EMPTY_MESSAGE'
        });
        return;
      }
      
      const messageObject = createMessageObject(
        socket.id,
        clientInfo.matchId,
        message,
        clientInfo.username
      );
      
      console.log(`Message from ${clientInfo.username} (${clientInfo.userType}) in match ${clientInfo.matchId}: ${message}`);
      
      // For chat users, broadcast to all chat users in the room except sender
      if (clientInfo.userType === 'chatuser') {
        const chatUsers = getUsersInMatch(clientInfo.matchId, 'chatuser');
        chatUsers.forEach(user => {
          if (user.socketId !== socket.id) {
            socket.to(user.socketId).emit('chat_message', messageObject);
          }
        });
      } else {
        // For generic users, broadcast to all users in the room except sender
        socket.to(clientInfo.roomId).emit('new_message', messageObject);
      }
      
      // Send confirmation to sender
      socket.emit('message_sent', {
        messageId: messageObject.id,
        timestamp: messageObject.timestamp
      });
      
    } catch (error) {
      console.error('Error in send_message:', error);
      socket.emit('error', {
        message: 'Failed to send message',
        code: 'SEND_MESSAGE_ERROR'
      });
    }
  });

  // Handle custom match events
  socket.on('match_event', (data) => {
    try {
      const { eventType, eventData } = data;
      const clientInfo = connectedClients.get(socket.id);
      
      if (!clientInfo) {
        socket.emit('error', {
          message: 'You must join a match first',
          code: 'NOT_IN_MATCH'
        });
        return;
      }
      
      const matchEvent = {
        eventType,
        eventData,
        matchId: clientInfo.matchId,
        username: clientInfo.username,
        timestamp: new Date().toISOString(),
        socketId: socket.id
      };
      
      console.log(`Match event from ${clientInfo.username}: ${eventType}`);
      
      // Broadcast event to all users in the room except sender
      socket.to(clientInfo.roomId).emit('match_event_received', matchEvent);
      
    } catch (error) {
      console.error('Error in match_event:', error);
      socket.emit('error', {
        message: 'Failed to process match event',
        code: 'MATCH_EVENT_ERROR'
      });
    }
  });

  // Handle getting room info
  socket.on('get_room_info', () => {
    try {
      const clientInfo = connectedClients.get(socket.id);
      
      if (!clientInfo) {
        socket.emit('room_info', {
          connected: false,
          message: 'Not connected to any match'
        });
        return;
      }
      
      const currentUsers = getUsersInMatch(clientInfo.matchId);
      
      socket.emit('room_info', {
        connected: true,
        matchId: clientInfo.matchId,
        username: clientInfo.username,
        connectedUsers: currentUsers.length,
        joinedAt: clientInfo.joinedAt
      });
      
    } catch (error) {
      console.error('Error in get_room_info:', error);
      socket.emit('error', {
        message: 'Failed to get room info',
        code: 'ROOM_INFO_ERROR'
      });
    }
  });

  // Handle match data polling requests
  socket.on('poll_match_data', async (data) => {
    try {
      const { matchId } = data;
      const clientInfo = connectedClients.get(socket.id);
      
      if (!clientInfo || clientInfo.matchId !== matchId) {
        socket.emit('error', {
          message: 'You must be in the match to poll its data',
          code: 'UNAUTHORIZED_POLL'
        });
        return;
      }
      
      console.log(`Manual poll requested for match ${matchId} by ${clientInfo.username}`);
      
      const pollResult = await forcePollMatch(matchId, io);
      
      if (pollResult) {
        socket.emit('match_data_updated', {
          matchId,
          lastUpdated: pollResult.lastUpdated,
          success: true
        });
      } else {
        socket.emit('error', {
          message: 'Failed to poll match data',
          code: 'POLL_FAILED'
        });
      }
      
    } catch (error) {
      console.error('Error in poll_match_data:', error);
      socket.emit('error', {
        message: 'Failed to poll match data',
        code: 'POLL_ERROR'
      });
    }
  });

  // Handle getting commentary data (commentary users)
  socket.on('get_commentary', () => {
    try {
      const clientInfo = connectedClients.get(socket.id);
      
      if (!clientInfo) {
        socket.emit('error', {
          message: 'You must join a match first',
          code: 'NOT_IN_MATCH'
        });
        return;
      }
      
      if (clientInfo.userType !== 'commentaryuser') {
        socket.emit('error', {
          message: 'Only commentary users can request commentary data',
          code: 'UNAUTHORIZED_COMMENTARY'
        });
        return;
      }
      
      const latestBallEvent = getLatestBallEvent(clientInfo.matchId);
      
      if (latestBallEvent) {
        socket.emit('commentary_update', latestBallEvent);
      } else {
        socket.emit('commentary_update', {
          message: 'No ball events available yet',
          matchId: clientInfo.matchId
        });
      }
      
    } catch (error) {
      console.error('Error in get_commentary:', error);
      socket.emit('error', {
        message: 'Failed to get commentary data',
        code: 'COMMENTARY_ERROR'
      });
    }
  });

  // Handle match data requests (match users)
  socket.on('get_match_data', () => {
    try {
      const clientInfo = connectedClients.get(socket.id);
      
      if (!clientInfo) {
        socket.emit('error', {
          message: 'You must join a match first',
          code: 'NOT_IN_MATCH'
        });
        return;
      }
      
      if (clientInfo.userType !== 'matchuser') {
        socket.emit('error', {
          message: 'Only match users can request match data',
          code: 'UNAUTHORIZED_MATCH_DATA'
        });
        return;
      }
      
      // For now, return dummy data as requested
      socket.emit('match_data_update', {
        matchId: clientInfo.matchId,
        timestamp: new Date().toISOString(),
        newFetch: true,
        message: 'Match data updated (dummy implementation)'
      });
      
    } catch (error) {
      console.error('Error in get_match_data:', error);
      socket.emit('error', {
        message: 'Failed to get match data',
        code: 'MATCH_DATA_ERROR'
      });
    }
  });

  // Handle manual commentary polling
  socket.on('poll_commentary', async (data) => {
    try {
      const { inningNumber } = data;
      const clientInfo = connectedClients.get(socket.id);
      
      if (!clientInfo) {
        socket.emit('error', {
          message: 'You must join a match first',
          code: 'NOT_IN_MATCH'
        });
        return;
      }
      
      if (clientInfo.userType !== 'commentaryuser') {
        socket.emit('error', {
          message: 'Only commentary users can poll commentary data',
          code: 'UNAUTHORIZED_COMMENTARY_POLL'
        });
        return;
      }
      
      console.log(`Manual commentary poll requested for match ${clientInfo.matchId} by ${clientInfo.username}`);
      
      const pollResult = await forcePollCommentary(clientInfo.matchId, inningNumber, io);
      
      if (pollResult) {
        socket.emit('commentary_polled', {
          matchId: clientInfo.matchId,
          inningNumber: pollResult.inningNumber,
          lastUpdated: pollResult.lastUpdated,
          success: true
        });
      } else {
        socket.emit('error', {
          message: 'Failed to poll commentary data',
          code: 'COMMENTARY_POLL_FAILED'
        });
      }
      
    } catch (error) {
      console.error('Error in poll_commentary:', error);
      socket.emit('error', {
        message: 'Failed to poll commentary data',
        code: 'COMMENTARY_POLL_ERROR'
      });
    }
  });

  // Handle getting match management status
  socket.on('get_match_status', () => {
    try {
      const status = getListeningMatchesStatus();
      socket.emit('match_status', status);
    } catch (error) {
      console.error('Error in get_match_status:', error);
      socket.emit('error', {
        message: 'Failed to get match status',
        code: 'MATCH_STATUS_ERROR'
      });
    }
  });
};

/**
 * Handle socket disconnection
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} io - Socket.IO server instance
 */
const handleDisconnection = (socket, io) => {
  try {
    const clientInfo = connectedClients.get(socket.id);
    
    if (clientInfo) {
      // Remove from new match management system
      const removedFromMatch = removeUserFromMatch(socket.id);
      
      if (removedFromMatch) {
        console.log(`User removed from match management: ${clientInfo.username} from ${removedFromMatch}`);
      }
      
      // Remove from legacy match room tracking
      const matchRoom = matchRooms.get(clientInfo.matchId);
      if (matchRoom) {
        matchRoom.delete(socket.id);
        
        // Clean up empty rooms
        if (matchRoom.size === 0) {
          matchRooms.delete(clientInfo.matchId);
        } else {
          // Notify remaining users
          const systemNotification = createSystemNotification(
            clientInfo.matchId,
            `${clientInfo.username} left the match`,
            'user_left'
          );
          
          io.to(clientInfo.roomId).emit('system_notification', systemNotification);
        }
      }
      
      console.log(`Socket ${socket.id} (${clientInfo.username}) disconnected from match ${clientInfo.matchId}`);
    } else {
      // Try to remove from match management even if not in legacy tracking
      const removedFromMatch = removeUserFromMatch(socket.id);
      if (removedFromMatch) {
        console.log(`User removed from match management on disconnect: ${socket.id} from ${removedFromMatch}`);
      }
    }
    
    // Remove from connected clients
    connectedClients.delete(socket.id);
    
  } catch (error) {
    console.error('Error in handleDisconnection:', error);
  }
};

/**
 * Helper function to make a socket leave its current room
 * @param {Object} socket - Socket.IO socket instance
 */
const leaveCurrentRoom = (socket) => {
  const clientInfo = connectedClients.get(socket.id);
  
  if (clientInfo) {
    socket.leave(clientInfo.roomId);
    
    // Remove from match room tracking
    const matchRoom = matchRooms.get(clientInfo.matchId);
    if (matchRoom) {
      matchRoom.delete(socket.id);
      
      if (matchRoom.size === 0) {
        matchRooms.delete(clientInfo.matchId);
      }
    }
    
    connectedClients.delete(socket.id);
  }
};

/**
 * Get statistics about connected matches and users
 * @returns {Object} Statistics object
 */
const getStats = () => {
  const legacyStats = {
    totalConnections: connectedClients.size,
    activeMatches: matchRooms.size,
    matchDetails: Array.from(matchRooms.entries()).map(([matchId, socketIds]) => ({
      matchId,
      connectedUsers: socketIds.size
    }))
  };
  
  const matchManagerStats = getListeningMatchesStatus();
  
  return {
    legacy: legacyStats,
    matchManager: matchManagerStats
  };
};

export {
  initializeHandlers,
  handleDisconnection,
  getStats
};

export default {
  initializeHandlers,
  handleDisconnection,
  getStats
};
