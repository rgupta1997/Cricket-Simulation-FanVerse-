import axios from 'axios';

// Chat History Service for Redis backend
class ChatHistoryService {
  constructor() {
    // Base URL for your Redis backend API
    this.baseURL = process.env.REACT_APP_CHAT_API_URL || 'http://localhost:3001/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get chat history for a user
  async getChatHistory(userId, limit = 50) {
    try {
      const response = await this.api.get(`/chat/history/${userId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  // Save a new chat message
  async saveMessage(messageData) {
    try {
      const response = await this.api.post('/chat/message', messageData);
      return response.data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // Get chat statistics for a user
  async getChatStats(userId) {
    try {
      const response = await this.api.get(`/chat/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat stats:', error);
      throw error;
    }
    }

  // Mark messages as read
  async markAsRead(userId, messageIds) {
    try {
      const response = await this.api.put(`/chat/read/${userId}`, { messageIds });
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Search chat history
  async searchChatHistory(userId, query, limit = 20) {
    try {
      const response = await this.api.get(`/chat/search/${userId}?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error searching chat history:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount(userId) {
    try {
      const response = await this.api.get(`/chat/unread/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Delete chat history for a user
  async deleteChatHistory(userId) {
    try {
      const response = await this.api.delete(`/chat/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }
  }
}

export default new ChatHistoryService();
