import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL for Sportz API
const SPORTZ_API_BASE_URL = process.env.SPORTZ_API_BASE_URL || 'https://demo.sportz.io/sifeeds/repo/cricket/live/json';
const POLLING_INTERVAL = parseInt(process.env.POLLING_INTERVAL) || 30000; // 30 seconds default

// User types
const USER_TYPES = {
  GENERIC: 'generic',
  CHAT_USER: 'chatuser',
  COMMENTARY_USER: 'commentaryuser',
  MATCH_USER: 'matchuser'
};

// Global object to track listening matches
const listenMatches = {};

// Commentary polling intervals tracking
const commentaryPolling = {};

/**
 * Add a user to a match and start polling if it's a new match
 * @param {string} matchId - The match ID
 * @param {string} userId - User identifier
 * @param {string} socketId - Socket ID
 * @param {Object} additionalInfo - Any additional user info (including userType)
 * @param {Object} io - Socket.IO server instance
 */
const addUserToMatch = (matchId, userId, socketId, additionalInfo = {}, io = null) => {
  if (!listenMatches[matchId]) {
    // Create new match entry
    listenMatches[matchId] = {
      users: [],
      timeoutId: null,
      isPolling: false,
      lastUpdate: null,
      commentaryPolling: {
        isPolling: false,
        timeoutId: null,
        currentInning: 1,
        lastCommentaryUpdate: null
      }
    };
    
    console.log(`📊 Created new match entry: ${matchId}`);
    
    // Start polling for this new match
    startMatchPolling(matchId, io);
  }
  
  // Check if user already exists (by socketId)
  const existingUserIndex = listenMatches[matchId].users.findIndex(user => user.socketId === socketId);
  
  const userType = additionalInfo.userType || USER_TYPES.GENERIC;
  
  if (existingUserIndex !== -1) {
    // Update existing user
    listenMatches[matchId].users[existingUserIndex] = {
      userId,
      socketId,
      userType,
      joinedAt: new Date().toISOString(),
      ...additionalInfo
    };
    console.log(`🔄 Updated user in match ${matchId}: ${userId} (${socketId}) - Type: ${userType}`);
  } else {
    // Add new user
    listenMatches[matchId].users.push({
      userId,
      socketId,
      userType,
      joinedAt: new Date().toISOString(),
      ...additionalInfo
    });
    console.log(`➕ Added user to match ${matchId}: ${userId} (${socketId}) - Type: ${userType}`);
  }
  
  // Check if we need to start commentary polling
  if (userType === USER_TYPES.COMMENTARY_USER) {
    startCommentaryPolling(matchId, io);
  }
  
  return listenMatches[matchId];
};

/**
 * Stop polling for a specific match
 * @param {string} matchId - The match ID to stop polling for
 */
const stopMatchPolling = (matchId) => {
  if (listenMatches[matchId] && listenMatches[matchId].timeoutId) {
    console.log(`⏹️ Stopping match polling for match: ${matchId}`);
    
    clearInterval(listenMatches[matchId].timeoutId);
    listenMatches[matchId].timeoutId = null;
    listenMatches[matchId].isPolling = false;
  }
};

/**
 * Remove a user from a match by socketId
 * @param {string} socketId - Socket ID to remove
 * @returns {string|null} - Match ID if user was found and removed
 */
const removeUserFromMatch = (socketId) => {
  for (const [matchId, matchData] of Object.entries(listenMatches)) {
    const userIndex = matchData.users.findIndex(user => user.socketId === socketId);
    
    if (userIndex !== -1) {
      const removedUser = matchData.users.splice(userIndex, 1)[0];
      console.log(`➖ Removed user from match ${matchId}: ${removedUser.userId} (${socketId}) - Type: ${removedUser.userType || 'unknown'}`);
      
      // If no users left in match, clean up
      if (matchData.users.length === 0) {
        console.log(`🧹 Match ${matchId} is empty, cleaning up...`);
        stopMatchPolling(matchId);
        stopCommentaryPolling(matchId);
        delete listenMatches[matchId];
      } else {
        // Check if we need to stop commentary polling (no commentary users left)
        const hasCommentaryUsers = matchData.users.some(user => user.userType === USER_TYPES.COMMENTARY_USER);
        if (!hasCommentaryUsers && matchData.commentaryPolling.isPolling) {
          console.log(`🎤 No more commentary users in ${matchId}, stopping commentary polling`);
          stopCommentaryPolling(matchId);
        }
      }
      
      return matchId;
    }
  }
  
  return null;
};

/**
 * Start polling for a specific match
 * @param {string} matchId - The match ID to poll for
 * @param {Object} io - Socket.IO server instance (optional, for emitting updates)
 */
const startMatchPolling = (matchId, io = null) => {
  if (listenMatches[matchId] && !listenMatches[matchId].isPolling) {
    console.log(`🔄 Starting polling for match: ${matchId}`);
    
    listenMatches[matchId].isPolling = true;
    
    // Start immediate poll
    pollMatchData(matchId, io);
    
    // Set up recurring polling
    const timeoutId = setInterval(() => {
      pollMatchData(matchId, io);
    }, POLLING_INTERVAL);
    
    listenMatches[matchId].timeoutId = timeoutId;
  }
};

/**
 * Get the current inning number from match data
 * @param {string} matchId - The match ID
 * @returns {number} Current inning number
 */
const getCurrentInning = (matchId) => {
  try {
    const matchFilePath = path.join(__dirname, '..', 'json', `${matchId}.json`);
    
    if (!fs.existsSync(matchFilePath)) {
      console.log(`⚠️ No match file found for ${matchId}, defaulting to inning 1`);
      return 1;
    }
    
    const matchData = JSON.parse(fs.readFileSync(matchFilePath, 'utf8'));
    
    if (matchData.data && matchData.data.Innings && Array.isArray(matchData.data.Innings)) {
      const innings = matchData.data.Innings;
      const currentInning = innings.length; // If array length is 2, current inning is 2
      console.log(`📊 Current inning for ${matchId}: ${currentInning} (based on innings array length: ${innings.length})`);
      return currentInning;
    }
    
    return 1;
  } catch (error) {
    console.error(`❌ Error getting current inning for ${matchId}:`, error.message);
    return 1;
  }
};

/**
 * Start commentary polling for a specific match
 * @param {string} matchId - The match ID to poll commentary for
 * @param {Object} io - Socket.IO server instance (optional, for emitting updates)
 */
const startCommentaryPolling = (matchId, io = null) => {
  if (!listenMatches[matchId]) {
    console.log(`⚠️ Match ${matchId} not found in listenMatches`);
    return;
  }
  
  if (listenMatches[matchId].commentaryPolling.isPolling) {
    console.log(`⚠️ Commentary polling already active for ${matchId}`);
    return;
  }
  
  console.log(`🎤 Starting commentary polling for match: ${matchId}`);
  
  // Get current inning
  const currentInning = getCurrentInning(matchId);
  listenMatches[matchId].commentaryPolling.currentInning = currentInning;
  listenMatches[matchId].commentaryPolling.isPolling = true;
  
  // Create match directory if it doesn't exist
  const matchDir = path.join(__dirname, '..', 'json', matchId);
  if (!fs.existsSync(matchDir)) {
    fs.mkdirSync(matchDir, { recursive: true });
  }
  
  // Start immediate poll
  pollCommentaryData(matchId, currentInning, io);
  
  // Set up recurring polling
  const timeoutId = setInterval(() => {
    // Check if we need to update the inning
    const latestInning = getCurrentInning(matchId);
    if (latestInning !== listenMatches[matchId].commentaryPolling.currentInning) {
      console.log(`📊 Inning changed from ${listenMatches[matchId].commentaryPolling.currentInning} to ${latestInning}`);
      listenMatches[matchId].commentaryPolling.currentInning = latestInning;
    }
    
    pollCommentaryData(matchId, latestInning, io);
  }, POLLING_INTERVAL);
  
  listenMatches[matchId].commentaryPolling.timeoutId = timeoutId;
};

/**
 * Stop commentary polling for a specific match
 * @param {string} matchId - The match ID to stop commentary polling for
 */
const stopCommentaryPolling = (matchId) => {
  if (listenMatches[matchId] && listenMatches[matchId].commentaryPolling.timeoutId) {
    console.log(`⏹️ Stopping commentary polling for match: ${matchId}`);
    
    clearInterval(listenMatches[matchId].commentaryPolling.timeoutId);
    listenMatches[matchId].commentaryPolling.timeoutId = null;
    listenMatches[matchId].commentaryPolling.isPolling = false;
  }
};

/**
 * Poll commentary data from Sportz API and save to local JSON file
 * @param {string} matchId - The match ID
 * @param {number} inningNumber - The inning number
 * @param {Object} io - Socket.IO server instance (optional, for emitting updates)
 */
const pollCommentaryData = async (matchId, inningNumber, io = null) => {
  try {
    // Construct the commentary API URL
    const apiUrl = `${SPORTZ_API_BASE_URL}/${matchId}_commentary_all_${inningNumber}.json`;
    console.log(`🎤 Polling Commentary API: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Save to local JSON file in match subdirectory
    const matchDir = path.join(__dirname, '..', 'json', matchId);
    const filePath = path.join(matchDir, `commentary_${inningNumber}.json`);
    
    // Ensure directory exists
    if (!fs.existsSync(matchDir)) {
      fs.mkdirSync(matchDir, { recursive: true });
    }
    
    // Add metadata to the saved data
    const dataWithMeta = {
      matchId,
      inningNumber,
      lastUpdated: new Date().toISOString(),
      apiUrl,
      data
    };
    
    fs.writeFileSync(filePath, JSON.stringify(dataWithMeta, null, 2));
    
    // Update last update time
    if (listenMatches[matchId]) {
      listenMatches[matchId].commentaryPolling.lastCommentaryUpdate = new Date().toISOString();
    }
    
    console.log(`💾 Saved commentary data for ${matchId} inning ${inningNumber} to ${filePath}`);
    
    // Process commentary for real-time updates
    processCommentaryForUpdates(matchId, inningNumber, data);
    
    // Emit commentary update to users
    if (io && listenMatches[matchId]) {
      emitCommentaryUpdateToUsers(io, matchId, dataWithMeta, inningNumber);
    }
    
    return dataWithMeta;
    
  } catch (error) {
    console.error(`❌ Error polling commentary data for ${matchId} inning ${inningNumber}:`, error.message);
    
    // Create error file for debugging
    const matchDir = path.join(__dirname, '..', 'json', matchId);
    const errorFilePath = path.join(matchDir, `commentary_${inningNumber}_error.json`);
    
    const errorData = {
      matchId,
      inningNumber,
      error: error.message,
      timestamp: new Date().toISOString(),
      apiUrl: `${SPORTZ_API_BASE_URL}/${matchId}_commentary_all_${inningNumber}.json`
    };
    
    try {
      if (!fs.existsSync(matchDir)) {
        fs.mkdirSync(matchDir, { recursive: true });
      }
      fs.writeFileSync(errorFilePath, JSON.stringify(errorData, null, 2));
    } catch (writeError) {
      console.error(`❌ Failed to write commentary error file:`, writeError.message);
    }
    
    return null;
  }
};

/**
 * Process commentary data to find new ball events and emit to users
 * @param {string} matchId - The match ID
 * @param {number} inningNumber - The inning number
 * @param {Object} commentaryData - The commentary data from API
 */
const processCommentaryForUpdates = (matchId, inningNumber, commentaryData) => {
  try {
    if (!commentaryData || !commentaryData.Commentary || !Array.isArray(commentaryData.Commentary)) {
      console.log(`⚠️ No commentary array found for ${matchId} inning ${inningNumber}`);
      return;
    }
    
    // Find all ball events (Isball: true) - get the most recent ones
    const ballEvents = commentaryData.Commentary.filter(comment => comment.Isball === true);
    
    if (ballEvents.length > 0) {
      // Get the first ball event (most recent)
      const latestBallEvent = ballEvents[0];
      
      console.log(`🏏 Found ${ballEvents.length} ball events for ${matchId} inning ${inningNumber}: Latest Over ${latestBallEvent.Over}.${latestBallEvent.Ball}`);
      
      // Extract detailed ball information
      const ballDetails = {
        ...latestBallEvent,
        inningNumber,
        processedAt: new Date().toISOString(),
        // Enhanced ball details
        ballInfo: {
          over: latestBallEvent.Over,
          ball: latestBallEvent.Ball,
          runs: latestBallEvent.Runs || 0,
          batsmanRuns: latestBallEvent.BatsmanRuns || 0,
          extras: latestBallEvent.Extras || 0,
          isWicket: latestBallEvent.Iswicket || false,
          commentary: latestBallEvent.Commentary || latestBallEvent.Comms || '',
          striker: latestBallEvent.Striker || latestBallEvent.StrikerName || 'Unknown',
          bowler: latestBallEvent.Bowler || latestBallEvent.BowlerName || 'Unknown',
          timestamp: latestBallEvent.Timestamp || new Date().toISOString()
        },
        // Include recent ball events for context (last 5 balls)
        recentBalls: ballEvents.slice(0, 5).map(ball => ({
          over: ball.Over,
          ball: ball.Ball,
          runs: ball.Runs || 0,
          isWicket: ball.Iswicket || false,
          commentary: ball.Commentary || ball.Comms || ''
        }))
      };
      
      // Store this for emission to commentary users
      if (listenMatches[matchId]) {
        listenMatches[matchId].commentaryPolling.latestBallEvent = ballDetails;
        
        // Also store commentary summary
        listenMatches[matchId].commentaryPolling.commentarySummary = {
          totalBalls: ballEvents.length,
          lastUpdate: new Date().toISOString(),
          currentOver: latestBallEvent.Over,
          currentBall: latestBallEvent.Ball,
          inningNumber
        };
      }
    } else {
      console.log(`📊 No ball events found in commentary for ${matchId} inning ${inningNumber}`);
      
      // Store empty state
      if (listenMatches[matchId]) {
        listenMatches[matchId].commentaryPolling.latestBallEvent = null;
        listenMatches[matchId].commentaryPolling.commentarySummary = {
          totalBalls: 0,
          lastUpdate: new Date().toISOString(),
          currentOver: 0,
          currentBall: 0,
          inningNumber
        };
      }
    }
    
  } catch (error) {
    console.error(`❌ Error processing commentary for updates:`, error.message);
  }
};

/**
 * Poll match data from Sportz API and save to local JSON file
 * @param {string} matchId - The match ID (should correspond to the filename)
 * @param {Object} io - Socket.IO server instance (optional, for emitting updates)
 */
const pollMatchData = async (matchId, io = null) => {
  try {
    // Construct the API URL
    const apiUrl = `${SPORTZ_API_BASE_URL}/${matchId}.json`;
    console.log(`🌐 Polling API: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Save to local JSON file
    const jsonDir = path.join(__dirname, '..', 'json');
    const filePath = path.join(jsonDir, `${matchId}.json`);
    
    // Ensure directory exists
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true });
    }
    
    // Add metadata to the saved data
    const dataWithMeta = {
      matchId,
      lastUpdated: new Date().toISOString(),
      apiUrl,
      data
    };
    
    fs.writeFileSync(filePath, JSON.stringify(dataWithMeta, null, 2));
    
    // Update last update time
    if (listenMatches[matchId]) {
      listenMatches[matchId].lastUpdate = new Date().toISOString();
    }
    
    console.log(`💾 Saved match data for ${matchId} to ${filePath}`);
    
    // Emit match update to all users in this match
    if (io && listenMatches[matchId]) {
      emitMatchUpdateToUsers(io, matchId, dataWithMeta);
    }
    
    return dataWithMeta;
    
  } catch (error) {
    console.error(`❌ Error polling match data for ${matchId}:`, error.message);
    
    // Create error file for debugging
    const jsonDir = path.join(__dirname, '..', 'json');
    const errorFilePath = path.join(jsonDir, `${matchId}_error.json`);
    
    const errorData = {
      matchId,
      error: error.message,
      timestamp: new Date().toISOString(),
      apiUrl: `${SPORTZ_API_BASE_URL}/${matchId}.json`
    };
    
    try {
      fs.writeFileSync(errorFilePath, JSON.stringify(errorData, null, 2));
    } catch (writeError) {
      console.error(`❌ Failed to write error file:`, writeError.message);
    }
    
    return null;
  }
};

/**
 * Emit match update to all users in a specific match
 * @param {Object} io - Socket.IO server instance
 * @param {string} matchId - The match ID
 * @param {Object} matchData - The updated match data
 */
const emitMatchUpdateToUsers = (io, matchId, matchData) => {
  const matchInfo = listenMatches[matchId];
  if (!matchInfo || !matchInfo.users.length) {
    return;
  }
  
  console.log(`📡 Emitting match update to ${matchInfo.users.length} users for match ${matchId}`);
  
  // Emit to each user socket individually
  matchInfo.users.forEach(user => {
    const socket = io.sockets.sockets.get(user.socketId);
    if (socket) {
      // Emit different events based on user type
      switch (user.userType) {
        case USER_TYPES.MATCH_USER:
          socket.emit('match_data_update', {
            matchId,
            data: matchData,
            timestamp: new Date().toISOString()
          });
          break;
        case USER_TYPES.GENERIC:
        case USER_TYPES.CHAT_USER:
          socket.emit('match_status_update', {
            matchId,
            summary: {
              lastUpdated: matchData.lastUpdated,
              status: matchData.data?.Matchdetail?.Status?.Name || 'Unknown'
            },
            timestamp: new Date().toISOString()
          });
          break;
        case USER_TYPES.COMMENTARY_USER:
          socket.emit('match_info_update', {
            matchId,
            summary: {
              lastUpdated: matchData.lastUpdated,
              currentInning: getCurrentInning(matchId),
              status: matchData.data?.Matchdetail?.Status?.Name || 'Unknown'
            },
            timestamp: new Date().toISOString()
          });
          break;
        default:
          socket.emit('match_update', {
            matchId,
            data: matchData,
            timestamp: new Date().toISOString()
          });
      }
      
      console.log(`📤 Sent match update to ${user.userType} user: ${user.userId} (${user.socketId})`);
    }
  });
};

/**
 * Emit commentary update to commentary users in a specific match
 * @param {Object} io - Socket.IO server instance
 * @param {string} matchId - The match ID
 * @param {Object} commentaryData - The updated commentary data
 * @param {number} inningNumber - The inning number
 */
const emitCommentaryUpdateToUsers = (io, matchId, commentaryData, inningNumber) => {
  const matchInfo = listenMatches[matchId];
  if (!matchInfo) return;
  
  // Get only commentary users
  const commentaryUsers = matchInfo.users.filter(user => user.userType === USER_TYPES.COMMENTARY_USER);
  
  if (!commentaryUsers.length) {
    console.log(`📡 No commentary users to emit to for match ${matchId}`);
    return;
  }
  
  // Get enhanced ball event data
  const latestBallEvent = getLatestBallEvent(matchId);
  const commentarySummary = matchInfo.commentaryPolling.commentarySummary || {};
  
  console.log(`📡 Emitting commentary update to ${commentaryUsers.length} commentary users for match ${matchId} inning ${inningNumber}`);
  
  const updatePayload = {
    matchId,
    inningNumber,
    data: commentaryData,
    latestBallEvent,
    commentarySummary,
    timestamp: new Date().toISOString(),
    // Enhanced real-time data
    ballDetails: latestBallEvent ? {
      currentOver: latestBallEvent.ballInfo?.over || 0,
      currentBall: latestBallEvent.ballInfo?.ball || 0,
      runs: latestBallEvent.ballInfo?.runs || 0,
      isWicket: latestBallEvent.ballInfo?.isWicket || false,
      striker: latestBallEvent.ballInfo?.striker || 'Unknown',
      bowler: latestBallEvent.ballInfo?.bowler || 'Unknown',
      commentary: latestBallEvent.ballInfo?.commentary || '',
      recentBalls: latestBallEvent.recentBalls || []
    } : null,
    statistics: {
      totalBalls: commentarySummary.totalBalls || 0,
      lastUpdate: commentarySummary.lastUpdate || new Date().toISOString(),
      pollingActive: matchInfo.commentaryPolling.isPolling
    }
  };
  
  commentaryUsers.forEach(user => {
    const socket = io.sockets.sockets.get(user.socketId);
    if (socket) {
      // Send comprehensive commentary update
      socket.emit('commentary_data_update', updatePayload);
      
      // Also send a specific ball event update if we have ball details
      if (latestBallEvent && latestBallEvent.ballInfo) {
        socket.emit('ball_event_update', {
          matchId,
          inningNumber,
          ballEvent: latestBallEvent.ballInfo,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`📤 Sent commentary update to user: ${user.userId} (${user.socketId}) - Latest ball: ${latestBallEvent?.ballInfo?.over || 'N/A'}.${latestBallEvent?.ballInfo?.ball || 'N/A'}`);
    }
  });
  
  // Also emit to generic users who might want match updates
  const genericUsers = matchInfo.users.filter(user => 
    user.userType === USER_TYPES.GENERIC || user.userType === USER_TYPES.CHAT_USER
  );
  
  if (genericUsers.length > 0 && latestBallEvent) {
    console.log(`📡 Sending ball summary to ${genericUsers.length} generic/chat users`);
    
    const simplifiedUpdate = {
      matchId,
      type: 'ball_update',
      over: latestBallEvent.ballInfo?.over || 0,
      ball: latestBallEvent.ballInfo?.ball || 0,
      runs: latestBallEvent.ballInfo?.runs || 0,
      commentary: latestBallEvent.ballInfo?.commentary || '',
      timestamp: new Date().toISOString()
    };
    
    genericUsers.forEach(user => {
      const socket = io.sockets.sockets.get(user.socketId);
      if (socket) {
        socket.emit('match_ball_update', simplifiedUpdate);
      }
    });
  }
};

/**
 * Get current listening matches status
 * @returns {Object} Current state of listening matches
 */
const getListeningMatchesStatus = () => {
  const status = {};
  
  for (const [matchId, matchData] of Object.entries(listenMatches)) {
    status[matchId] = {
      userCount: matchData.users.length,
      isPolling: matchData.isPolling,
      lastUpdate: matchData.lastUpdate,
      users: matchData.users.map(user => ({
        userId: user.userId,
        socketId: user.socketId,
        joinedAt: user.joinedAt
      }))
    };
  }
  
  return status;
};

/**
 * Get users in a specific match filtered by user type
 * @param {string} matchId - The match ID
 * @param {string} userType - The user type to filter by (optional)
 * @returns {Array} Array of users in the match
 */
const getUsersInMatch = (matchId, userType = null) => {
  const matchData = listenMatches[matchId];
  if (!matchData) return [];
  
  if (userType) {
    return matchData.users.filter(user => user.userType === userType);
  }
  
  return matchData.users || [];
};

/**
 * Get latest ball event for commentary users
 * @param {string} matchId - The match ID
 * @returns {Object|null} Latest ball event or null
 */
const getLatestBallEvent = (matchId) => {
  const matchData = listenMatches[matchId];
  if (!matchData || !matchData.commentaryPolling) return null;
  
  return matchData.commentaryPolling.latestBallEvent || null;
};

/**
 * Get commentary summary for a specific match
 * @param {string} matchId - The match ID
 * @returns {Object|null} Commentary summary or null
 */
const getCommentarySummary = (matchId) => {
  const matchData = listenMatches[matchId];
  if (!matchData || !matchData.commentaryPolling) return null;
  
  return {
    ...matchData.commentaryPolling.commentarySummary,
    latestBallEvent: matchData.commentaryPolling.latestBallEvent,
    isPolling: matchData.commentaryPolling.isPolling,
    currentInning: matchData.commentaryPolling.currentInning,
    lastUpdate: matchData.commentaryPolling.lastCommentaryUpdate
  };
};

/**
 * Force poll commentary data for a specific match and inning
 * @param {string} matchId - The match ID
 * @param {number} inningNumber - The inning number (optional, will detect current)
 * @param {Object} io - Socket.IO server instance (optional, for emitting updates)
 * @returns {Promise} Promise that resolves with poll result
 */
const forcePollCommentary = async (matchId, inningNumber = null, io = null) => {
  const inning = inningNumber || getCurrentInning(matchId);
  return await pollCommentaryData(matchId, inning, io);
};

/**
 * Check if a match is being monitored
 * @param {string} matchId - The match ID
 * @returns {boolean} True if match is being monitored
 */
const isMatchBeingMonitored = (matchId) => {
  return !!listenMatches[matchId];
};

/**
 * Force poll a specific match immediately
 * @param {string} matchId - The match ID to poll
 * @param {Object} io - Socket.IO server instance (optional, for emitting updates)
 * @returns {Promise} Promise that resolves with poll result
 */
const forcePollMatch = async (matchId, io = null) => {
  return await pollMatchData(matchId, io);
};

/**
 * Clean up all polling intervals (for graceful shutdown)
 */
const cleanupAllPolling = () => {
  console.log('🧹 Cleaning up all polling intervals...');
  
  for (const [, matchData] of Object.entries(listenMatches)) {
    if (matchData.timeoutId) {
      clearInterval(matchData.timeoutId);
    }
    if (matchData.commentaryPolling && matchData.commentaryPolling.timeoutId) {
      clearInterval(matchData.commentaryPolling.timeoutId);
    }
  }
  
  // Clear the entire object
  Object.keys(listenMatches).forEach(key => delete listenMatches[key]);
  
  console.log('✅ All polling cleaned up');
};

export {
  USER_TYPES,
  addUserToMatch,
  removeUserFromMatch,
  startMatchPolling,
  stopMatchPolling,
  startCommentaryPolling,
  stopCommentaryPolling,
  pollMatchData,
  pollCommentaryData,
  emitMatchUpdateToUsers,
  emitCommentaryUpdateToUsers,
  getListeningMatchesStatus,
  getUsersInMatch,
  getLatestBallEvent,
  getCommentarySummary,
  isMatchBeingMonitored,
  forcePollMatch,
  forcePollCommentary,
  getCurrentInning,
  cleanupAllPolling,
  listenMatches // Export for direct access if needed
};
