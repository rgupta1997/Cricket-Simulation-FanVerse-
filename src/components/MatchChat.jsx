import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MatchChat.css';
import { chatService } from '../services/chatService';

const MatchChat = ({ matchId, matchName, isOpen, onClose, currentUser, onLogout }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      userId: 'system',
      userName: 'System',
      userAvatar: '🏏',
      text: `🏏 Welcome to ${matchName} chat! Start discussing the match!`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load messages from API when chat opens or matchId changes
  useEffect(() => {
    if (isOpen && matchId) {
      loadMessages();
    }
  }, [isOpen, matchId]);

  // Auto-refresh messages every 10 seconds when chat is open
  useEffect(() => {
    if (!isOpen || !matchId) return;

    const interval = setInterval(() => {
      loadMessages();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [isOpen, matchId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load messages from API
  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      const apiMessages = await chatService.getMessages(matchId);
      setMessages(prev => {
        // Keep system message and add API messages
        const systemMessage = prev.find(msg => msg.type === 'system');
        return systemMessage ? [systemMessage, ...apiMessages] : apiMessages;
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages. Please try again.');
      // Keep existing messages if API fails
    } finally {
      setIsLoading(false);
    }
  };

  // Send message function
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !currentUser || !matchId) {
      return;
    }

    const messageText = inputMessage.trim();
    setInputMessage(''); // Clear input immediately for better UX
    
    // Show typing indicator
    setIsTyping(true);

    try {
      setError(null); // Clear any previous errors
      // Post message to API
      await chatService.postMessage(currentUser.userId, matchId, messageText);
      
      // Reload messages to get the latest from API
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      // Restore the message text so user can retry
      setInputMessage(messageText);
    } finally {
      setIsTyping(false);
    }
  }, [inputMessage, currentUser, matchId]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error]);

  if (!isOpen) return null;

  return (
    <div className="match-chat-drawer">
      {/* Chat Header */}
      <div className="match-chat-header">
        <div className="match-chat-header-left">
          <div className="match-chat-title">🏏 {matchName}</div>
          <div className="match-chat-subtitle">
            {currentUser ? `Chatting as: ${currentUser.firstName} ${currentUser.lastName}` : 'Login to start chatting'}
          </div>
        </div>
        <div className="header-actions">
          {currentUser && (
            <button onClick={loadMessages} className="refresh-button" title="Refresh messages">
              🔄
            </button>
          )}
          {currentUser && (
            <button onClick={onLogout} className="logout-button" title="Logout">
              🚪
            </button>
          )}
          <button onClick={onClose} className="close-chat-button">
            ✕
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="match-chat-messages" ref={chatContainerRef}>
        {/* Loading indicator */}
        {isLoading && (
          <div className="loading-message">
            <div className="loading-spinner">🔄</div>
            <span>Loading messages...</span>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.userId === currentUser?.userId ? 'own-message' : 'other-message'} ${message.type === 'system' ? 'system-message' : ''}`}
          >
            <div className="message-avatar">
              {message.userAvatar}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-username">{message.userName}</span>
                <span className="message-time">{message.timestamp}</span>
              </div>
              <div className="message-text">{message.text}</div>
            </div>
          </div>
        ))}
        
        {/* Error message */}
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <span>{error}</span>
          </div>
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="message other-message">
            <div className="message-avatar">⚡</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      {currentUser ? (
        <div className="match-chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="message-input"
          />
          <button onClick={sendMessage} className="send-button">
            ➤
          </button>
        </div>
      ) : (
        <div className="login-required-message">
          Please login to start chatting
        </div>
      )}
    </div>
  );
};

export default MatchChat;
