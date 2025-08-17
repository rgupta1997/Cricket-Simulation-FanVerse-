import React from 'react';
import { CAMERA_VIEWS } from '../constants/cameraViews';

const CameraControlsDisabled = ({ currentView, onViewChange }) => {
  const cameraViews = [
    { key: 'UMPIRE', view: CAMERA_VIEWS.UMPIRE, icon: '🏏', color: '#FF6B6B' },
    { key: 'TOP', view: CAMERA_VIEWS.TOP, icon: '⬆️', color: '#4ECDC4' },
    { key: 'BIRD_EYE', view: CAMERA_VIEWS.BIRD_EYE, icon: '🦅', color: '#45B7D1' },
    { key: 'LEFT', view: CAMERA_VIEWS.LEFT, icon: '⬅️', color: '#96CEB4' },
    { key: 'RIGHT', view: CAMERA_VIEWS.RIGHT, icon: '➡️', color: '#FFEAA7' },
    { key: 'CENTER', view: CAMERA_VIEWS.CENTER, icon: '🎯', color: '#DDA0DD' }
  ];

  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      <div style={{ 
        fontWeight: 'bold', 
        color: '#FFD700', 
        marginBottom: '8px', 
        fontSize: '13px',
        borderBottom: '1px solid #333',
        paddingBottom: '5px'
      }}>
        📹 Camera Angles (Button Controls Only)
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {cameraViews.map((camera) => {
          const isActive = currentView?.name === camera.view.name;
          
          return (
            <button
              key={camera.key}
              onClick={() => onViewChange(camera.key)}
              style={{
                background: isActive 
                  ? `linear-gradient(135deg, ${camera.color}, ${camera.color}CC)` 
                  : 'rgba(255,255,255,0.1)',
                color: isActive ? '#000' : '#fff',
                border: isActive ? `2px solid ${camera.color}` : '1px solid #333',
                borderRadius: '8px',
                padding: '8px 6px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 4px 12px ${camera.color}40` : 'none',
                transform: isActive ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'scale(1.02)';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              <span style={{ fontSize: '14px' }}>{camera.icon}</span>
              <span style={{ fontSize: '9px', textAlign: 'center' }}>
                {camera.view.name.replace(' View', '')}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ 
        marginTop: '8px', 
        padding: '6px',
        background: 'rgba(255,68,68,0.1)',
        borderRadius: '4px',
        fontSize: '9px',
        color: '#FF6B6B',
        border: '1px solid #FF6B6B'
      }}>
        <div style={{ color: '#FF6B6B', fontWeight: 'bold', marginBottom: '3px' }}>
          ⚠️ Hotkeys Disabled:
        </div>
        <div>🚫 Number keys (1-6) no longer work</div>
        <div>✅ Use camera buttons above instead</div>
        <div>🖱️ Mouse orbit/zoom still available</div>
      </div>
    </div>
  );
};

export default CameraControlsDisabled;
