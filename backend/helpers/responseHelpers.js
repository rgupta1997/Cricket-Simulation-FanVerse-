/**
 * Pure function to generate ping response
 * @returns {Object} Ping response object
 */
const generatePingResponse = () => {
  return {
    message: 'pong',
    timestamp: new Date().toISOString(),
    server: 'Cricket Simulation Backend',
    status: 'healthy',
    uptime: process.uptime()
  };
};

/**
 * Pure function to validate match ID format
 * @param {string} matchId - Match ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidMatchId = (matchId) => {
  if (!matchId || typeof matchId !== 'string') {
    return false;
  }
  
  // Match ID should be alphanumeric and between 3-50 characters
  const matchIdRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return matchIdRegex.test(matchId);
};

/**
 * Pure function to sanitize message content
 * @param {string} message - Message to sanitize
 * @returns {string} Sanitized message
 */
const sanitizeMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return '';
  }
  
  // Remove any potentially harmful content and trim
  return message
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, 1000); // Limit message length
};

/**
 * Pure function to generate unique room ID for match
 * @param {string} matchId - Match ID
 * @returns {string} Room ID
 */
const generateRoomId = (matchId) => {
  return `match_${matchId}`;
};

/**
 * Pure function to create standardized message object
 * @param {string} socketId - Socket ID of sender
 * @param {string} matchId - Match ID
 * @param {string} message - Message content
 * @param {string} username - Username (optional)
 * @returns {Object} Standardized message object
 */
const createMessageObject = (socketId, matchId, message, username = 'Anonymous') => {
  return {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    socketId,
    matchId,
    username: sanitizeMessage(username),
    message: sanitizeMessage(message),
    timestamp: new Date().toISOString(),
    type: 'message'
  };
};

/**
 * Pure function to create system notification object
 * @param {string} matchId - Match ID
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 * @returns {Object} System notification object
 */
const createSystemNotification = (matchId, message, type = 'system') => {
  return {
    id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    matchId,
    message: sanitizeMessage(message),
    timestamp: new Date().toISOString(),
    type,
    isSystem: true
  };
};

export {
  generatePingResponse,
  isValidMatchId,
  sanitizeMessage,
  generateRoomId,
  createMessageObject,
  createSystemNotification
};
