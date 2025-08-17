import React from 'react';
import { CAMERA_VIEWS } from '../constants/cameraViews';

const CameraControls = ({ currentView, onViewChange }) => {
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
        📹 Camera Angles (Replace Number Hotkeys)
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
              <span style={{ 
                fontSize: '8px', 
                color: isActive ? '#333' : '#888',
                fontWeight: 'normal'
              }}>
                (Button Only)
              </span>
            </button>
          );
        })}
      </div>

              <div style={{ 
          marginTop: '8px', 
          padding: '6px',
          background: 'rgba(255,215,0,0.1)',
          borderRadius: '4px',
          fontSize: '9px',
          color: '#ccc',
          border: '1px solid #FFD700'
        }}>
          <div style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: '3px' }}>
            Camera Controls:
          </div>
          <div>✅ Click buttons to switch camera angles</div>
          <div>🖱️ Mouse: Drag to orbit, Scroll to zoom</div>
          <div>⌨️ Hotkeys: Removed - Use buttons only</div>
        </div>
    </div>
  );
};

export default CameraControls;
