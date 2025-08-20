import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import './SessionTimer.css';

const SessionTimer = ({ onSessionExpired, onLogout }) => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Get initial session info
    updateSessionInfo();

    // Set up session monitoring
    const cleanup = authService.startSessionMonitoring((status, remainingTime) => {
      if (status === 'expired') {
        setShowWarning(false);
        if (onSessionExpired) onSessionExpired();
      } else if (status === 'warning') {
        setShowWarning(true);
      }
    });

    // Update session info every minute
    const interval = setInterval(updateSessionInfo, 60 * 1000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [onSessionExpired]);

  const updateSessionInfo = () => {
    const info = authService.getSessionInfo();
    setSessionInfo(info);
  };

  const refreshSession = () => {
    authService.refreshSession();
    updateSessionInfo();
    setShowWarning(false);
  };

  const formatTime = (minutes) => {
    if (minutes <= 0) return 'Expired';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTimeColor = (remainingTime) => {
    if (remainingTime <= 5) return '#dc2626'; // Red for critical
    if (remainingTime <= 15) return '#f59e0b'; // Orange for warning
    return '#059669'; // Green for normal
  };

  if (!sessionInfo?.user) return null;

  return (
    <div className="session-timer">
      {/* Session Info */}
      <div className="session-info">
        <span className="user-name">
          👤 {sessionInfo.user.firstName} {sessionInfo.user.lastName}
        </span>
        <div className="session-controls">
          <span 
            className="session-time"
            style={{ color: getTimeColor(sessionInfo.remainingTime) }}
          >
            ⏰ {formatTime(sessionInfo.remainingTime)}
          </span>
          <button 
            onClick={refreshSession}
            className="refresh-session-btn"
            title="Extend session by 60 minutes"
          >
            🔄
          </button>
          <button 
            onClick={onLogout}
            className="logout-btn"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>

      {/* Session Warning Modal */}
      {showWarning && (
        <div className="session-warning-overlay">
          <div className="session-warning-modal">
            <div className="warning-header">
              <span className="warning-icon">⚠️</span>
              <h3>Session Expiring Soon</h3>
            </div>
            <div className="warning-content">
              <p>Your session will expire in {sessionInfo.remainingTime} minutes.</p>
              <p>Would you like to extend your session?</p>
            </div>
            <div className="warning-actions">
              <button 
                onClick={refreshSession}
                className="extend-session-btn"
              >
                Extend Session
              </button>
              <button 
                onClick={() => setShowWarning(false)}
                className="dismiss-warning-btn"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Status Bar */}
      <div className="session-status-bar">
        <div 
          className="session-progress"
          style={{
            width: `${(sessionInfo.remainingTime / sessionInfo.sessionDuration) * 100}%`,
            backgroundColor: getTimeColor(sessionInfo.remainingTime)
          }}
        />
      </div>
    </div>
  );
};

export default SessionTimer;
