import React, { useState } from 'react';
import './ChatwootChatbot.css';

const ChatwootChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🏏 Welcome to Cricket Simulation FanVerse! How can I help you today?",
      type: 'agent',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      type: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    // Add bot response
    const botResponse = {
      id: Date.now() + 1,
      text: getBotResponse(inputMessage),
      type: 'agent',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputMessage('');
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('cricket') || message.includes('match')) {
      return "🏏 Cricket is a fantastic sport! We have live matches, commentary, and detailed statistics. What would you like to know?";
    } else if (message.includes('help') || message.includes('support')) {
      return "💬 I'm here to help! You can ask me about cricket rules, match details, or technical support.";
    } else if (message.includes('score') || message.includes('result')) {
      return "📊 Check out our live scorecards and match results in the Scorecard tab!";
    } else if (message.includes('commentary')) {
      return "🎙️ We have detailed ball-by-ball commentary for all matches. Check the Commentary tab!";
    } else if (message.includes('team') || message.includes('player')) {
      return "👥 We have comprehensive team and player information. Explore the Match Info tab!";
    } else {
      return "🤔 That's an interesting question! Feel free to ask me about cricket, matches, or how to use this simulation.";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="custom-chat-button" onClick={toggleChat}>
        <div className="chat-icon">💬</div>
        <div className="chat-label">Cricket Chat</div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-title">
              🏏 Cricket Support
            </div>
            <button className="chat-close-btn" onClick={toggleChat}>
              ×
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.type}`}>
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="chat-send-btn" onClick={sendMessage}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatwootChatbot;
