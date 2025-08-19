// Chat service for handling chat API calls
const CHAT_API_BASE = 'https://playground-dev.sportz.io/api';

export const chatService = {
  // Get messages for a specific match
  async getMessages(matchId) {
    try {
      const response = await fetch(`${CHAT_API_BASE}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ match_id: matchId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response to match our chat format
      return data.messages.map(msg => ({
        id: `${msg.user_id}_${msg.timestamp}`, // Create unique ID
        userId: msg.user_id,
        userName: msg.user_name,
        userAvatar: '👤',
        text: msg.message,
        timestamp: new Date(msg.timestamp).toLocaleTimeString(),
        epochTime: msg.timestamp, // Keep original epoch time for sorting
        type: 'user'
      })).sort((a, b) => a.epochTime - b.epochTime); // Sort by epoch time
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Post a new message
  async postMessage(userId, matchId, message) {
    try {
      const response = await fetch(`${CHAT_API_BASE}/chat/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          match_id: matchId,
          message: message
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to post message: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error posting message:', error);
      throw error;
    }
  }
};
