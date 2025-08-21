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
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '380px',
      height: '520px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      boxShadow: '0 15px 40px rgba(161, 129, 231, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid rgba(161, 129, 231, 0.2)',
      zIndex: 2000,
      animation: 'slideUp 0.2s ease-out'
    }}>
      {/* Chat Header */}
      <div style={{
        background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '20px 20px 0 0',
        position: 'relative'
      }}>
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #a181e7 0%, #baa2e6 50%, #ecaf1a 100%)',
          borderRadius: '20px 20px 0 0'
        }}></div>
        
        <div style={{ flex: 1, marginTop: '4px' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>🏏</span>
            {matchName}
          </div>
          <div style={{
            fontSize: '13px',
            opacity: 0.9,
            fontWeight: '500'
          }}>
            {currentUser ? `Chatting as: ${currentUser.firstName} ${currentUser.lastName}` : 'Login to start chatting'}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {currentUser && (
            <button 
              onClick={loadMessages} 
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}
              title="Refresh messages"
            >
              🔄
            </button>
          )}
          {currentUser && (
            <button 
              onClick={onLogout} 
              style={{
                background: 'rgba(236, 175, 26, 0.8)',
                border: 'none',
                color: 'white',
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e09e0d';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(236, 175, 26, 0.8)';
                e.target.style.transform = 'scale(1)';
              }}
              title="Logout"
            >
              🚪
            </button>
          )}
          <button 
            onClick={onClose} 
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 0.2s ease',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, #f1ecfa 0%, #ede6fa 50%, #dacdf6 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        ref={chatContainerRef}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            border: '1px solid rgba(161, 129, 231, 0.2)',
            boxShadow: '0 4px 16px rgba(161, 129, 231, 0.1)'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '3px solid rgba(161, 129, 231, 0.3)',
              borderTop: '3px solid #a181e7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{
              color: '#a181e7',
              fontSize: '14px',
              fontWeight: '600'
            }}>Loading messages...</span>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              gap: '12px',
              maxWidth: '100%',
              flexDirection: message.userId === currentUser?.userId ? 'row-reverse' : 'row'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: message.type === 'system' 
                ? 'linear-gradient(135deg, #e0bda9 0%, #d4a574 100%)' 
                : message.userId === currentUser?.userId 
                  ? 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)' 
                  : 'linear-gradient(135deg, #baa2e6 0%, #dacdf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 2px 8px rgba(161, 129, 231, 0.2)'
            }}>
              {message.userAvatar}
            </div>
            <div style={{
              flex: 1,
              maxWidth: 'calc(100% - 52px)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '6px',
                flexDirection: message.userId === currentUser?.userId ? 'row-reverse' : 'row'
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>{message.userName}</span>
                <span style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  fontWeight: '500'
                }}>{message.timestamp}</span>
              </div>
              <div style={{
                background: message.type === 'system'
                  ? 'rgba(224, 189, 169, 0.2)'
                  : message.userId === currentUser?.userId
                    ? 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)'
                    : 'rgba(255, 255, 255, 0.9)',
                color: message.type === 'system'
                  ? '#8b5a3c'
                  : message.userId === currentUser?.userId
                    ? 'white'
                    : '#1f2937',
                padding: '12px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                lineHeight: '1.5',
                wordWrap: 'break-word',
                boxShadow: message.userId === currentUser?.userId
                  ? '0 4px 16px rgba(161, 129, 231, 0.3)'
                  : '0 2px 8px rgba(161, 129, 231, 0.1)',
                border: message.type === 'system'
                  ? '1px solid rgba(224, 189, 169, 0.3)'
                  : message.userId === currentUser?.userId
                    ? 'none'
                    : '1px solid rgba(161, 129, 231, 0.2)',
                fontStyle: message.type === 'system' ? 'italic' : 'normal',
                textAlign: message.type === 'system' ? 'center' : 'left',
                fontWeight: message.type === 'system' ? '500' : '400'
              }}>
                {message.text}
              </div>
            </div>
          </div>
        ))}
        
        {/* Error message */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px 20px',
            margin: '10px 0',
            background: 'rgba(236, 175, 26, 0.1)',
            border: '1px solid rgba(236, 175, 26, 0.3)',
            borderRadius: '16px',
            color: '#b45309',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <div style={{ fontSize: '18px' }}>⚠️</div>
            <span>{error}</span>
          </div>
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            gap: '12px',
            maxWidth: '100%'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ecaf1a 0%, #e0bda9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 2px 8px rgba(236, 175, 26, 0.2)'
            }}>
              ⚡
            </div>
            <div style={{
              flex: 1,
              maxWidth: 'calc(100% - 52px)'
            }}>
              <div style={{
                display: 'flex',
                gap: '6px',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                width: 'fit-content',
                border: '1px solid rgba(161, 129, 231, 0.2)',
                boxShadow: '0 2px 8px rgba(161, 129, 231, 0.1)'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#a181e7',
                  animation: 'typing 1.4s infinite ease-in-out'
                }}></span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#a181e7',
                  animation: 'typing 1.4s infinite ease-in-out',
                  animationDelay: '-0.16s'
                }}></span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#a181e7',
                  animation: 'typing 1.4s infinite ease-in-out',
                  animationDelay: '-0.32s'
                }}></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      {currentUser ? (
        <div style={{
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderTop: '1px solid rgba(161, 129, 231, 0.2)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '14px 20px',
              border: '2px solid rgba(161, 129, 231, 0.3)',
              borderRadius: '25px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#1f2937',
              fontWeight: '500'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#a181e7';
              e.target.style.boxShadow = '0 0 0 3px rgba(161, 129, 231, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(161, 129, 231, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button 
            onClick={sendMessage} 
            style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(161, 129, 231, 0.3)',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(161, 129, 231, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 16px rgba(161, 129, 231, 0.3)';
            }}
          >
            ➤
          </button>
        </div>
      ) : (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          borderTop: '1px solid rgba(161, 129, 231, 0.2)'
        }}>
          <div style={{
            color: '#a181e7',
            fontSize: '15px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>🔐</span>
            Please login to start chatting
          </div>
        </div>
      )}
      
      {/* Add keyframes for animations */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MatchChat;
