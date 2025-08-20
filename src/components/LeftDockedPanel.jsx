import { useState } from 'react';
import { createPortal } from 'react-dom';

const LeftDockedPanel = ({ gameState }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Get ball position and velocity from game state
  const ballPosition = gameState?.ballState?.position || [0, 0, 0];
  const ballVelocity = gameState?.ballState?.velocity || [0, 0, 0];
  const isMoving = gameState?.ballState?.isMoving || false;
  
  // Calculate ball speed
  const ballSpeed = Math.sqrt(
    ballVelocity[0] * ballVelocity[0] + 
    ballVelocity[1] * ballVelocity[1] + 
    ballVelocity[2] * ballVelocity[2]
  );

  // Get ball trajectory data if available
  const trajectory = gameState?.ballState?.trajectory || null;
  
  // Calculate distance from striker (assuming striker is at [0, 0, -9])
  const strikerPosition = [0, 0, -9];
  const distanceFromStriker = Math.sqrt(
    Math.pow(ballPosition[0] - strikerPosition[0], 2) + 
    Math.pow(ballPosition[2] - strikerPosition[2], 2)
  );

  const panelContent = (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: isCollapsed ? '50px' : '320px',
      height: '100vh',
      transition: 'width 0.3s ease-in-out',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRight: '2px solid rgba(255, 102, 0, 0.3)',
      zIndex: 1000,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '10px',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Panel Header */}
      <div style={{
        borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 102, 0, 0.3)',
        paddingBottom: '10px',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          opacity: isCollapsed ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out',
          visibility: isCollapsed ? 'hidden' : 'visible'
        }}>
          <h2 style={{
            color: '#FF6600',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📍 Ball Position
          </h2>
          <div style={{
            background: 'rgba(255, 102, 0, 0.1)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#FF6600',
            border: '1px solid rgba(255, 102, 0, 0.3)'
          }}>
            LIVE
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FF6600',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            transition: 'background-color 0.2s ease',
            position: isCollapsed ? 'fixed' : 'relative',
            left: isCollapsed ? '10px' : '0',
            top: isCollapsed ? '10px' : '0',
            zIndex: 1001
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 102, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          {isCollapsed ? '⮜' : '⮞'}
        </button>
      </div>

      {/* Main Content Container */}
      <div style={{
        opacity: isCollapsed ? 0 : 1,
        visibility: isCollapsed ? 'hidden' : 'visible',
        transition: 'opacity 0.2s ease-in-out',
        height: isCollapsed ? 0 : 'auto',
        overflow: 'hidden'
      }}>
        {/* Ball Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px',
          padding: '8px',
          background: isMoving ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
          borderRadius: '6px',
          border: `1px solid ${isMoving ? '#00AA00' : '#AA0000'}`
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isMoving ? '#00FF00' : '#FF0000',
            boxShadow: `0 0 10px ${isMoving ? '#00FF00' : '#FF0000'}`
          }}></div>
          <span style={{
            color: isMoving ? '#00FF00' : '#FF4444',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {isMoving ? '🏃 MOVING' : '⏸️ STOPPED'}
          </span>
        </div>

        {/* Current Position */}
        <div style={{
          background: 'rgba(255, 102, 0, 0.1)',
          border: '1px solid rgba(255, 102, 0, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '15px'
        }}>
          <div style={{
            color: '#FF6600',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            📍 Current Position
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <div style={{ color: '#FFD700', marginBottom: '4px' }}>
              X: <span style={{ color: 'white' }}>{ballPosition[0].toFixed(2)}m</span>
            </div>
            <div style={{ color: '#FFD700', marginBottom: '4px' }}>
              Y: <span style={{ color: 'white' }}>{ballPosition[1].toFixed(2)}m</span>
            </div>
            <div style={{ color: '#FFD700', marginBottom: '8px' }}>
              Z: <span style={{ color: 'white' }}>{ballPosition[2].toFixed(2)}m</span>
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: '#aaa',
              borderTop: '1px solid rgba(255, 102, 0, 0.2)',
              paddingTop: '6px'
            }}>
              Distance from striker: {distanceFromStriker.toFixed(1)}m
            </div>
          </div>
        </div>

        {/* Ball Movement */}
        <div style={{
          background: 'rgba(0, 200, 255, 0.1)',
          border: '1px solid rgba(0, 200, 255, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '15px'
        }}>
          <div style={{
            color: '#00C8FF',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            ⚡ Velocity & Speed
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <div style={{ color: '#00C8FF', marginBottom: '4px' }}>
              Vx: <span style={{ color: 'white' }}>{ballVelocity[0].toFixed(2)} m/s</span>
            </div>
            <div style={{ color: '#00C8FF', marginBottom: '4px' }}>
              Vy: <span style={{ color: 'white' }}>{ballVelocity[1].toFixed(2)} m/s</span>
            </div>
            <div style={{ color: '#00C8FF', marginBottom: '8px' }}>
              Vz: <span style={{ color: 'white' }}>{ballVelocity[2].toFixed(2)} m/s</span>
            </div>
            <div style={{ 
              fontSize: '12px',
              color: ballSpeed > 0 ? '#00FF00' : '#666',
              fontWeight: 'bold',
              borderTop: '1px solid rgba(0, 200, 255, 0.2)',
              paddingTop: '6px'
            }}>
              🏃 Speed: {ballSpeed.toFixed(1)} m/s
            </div>
          </div>
        </div>

        {/* Ball Height Status */}
        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '15px'
        }}>
          <div style={{
            color: '#FFD700',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            📏 Height Analysis
          </div>
          <div style={{ fontSize: '12px' }}>
            <div style={{ marginBottom: '6px' }}>
              <span style={{ color: '#FFD700' }}>Ground Level:</span>
              <span style={{ 
                color: ballPosition[1] <= 0.1 ? '#00FF00' : '#FF6600',
                marginLeft: '8px',
                fontWeight: 'bold'
              }}>
                {ballPosition[1] <= 0.1 ? '✅ On Ground' : '🔺 In Air'}
              </span>
            </div>
            <div style={{ marginBottom: '6px' }}>
              <span style={{ color: '#FFD700' }}>Max Height:</span>
              <span style={{ color: 'white', marginLeft: '8px' }}>
                {ballPosition[1] > 3 ? '🔴 High' : ballPosition[1] > 1 ? '🟡 Medium' : '🟢 Low'}
              </span>
            </div>
            <div>
              <span style={{ color: '#FFD700' }}>Ball Type:</span>
              <span style={{ color: 'white', marginLeft: '8px' }}>
                {ballPosition[1] > 2 ? '🚀 Lofted Shot' : '⚡ Ground Shot'}
              </span>
            </div>
          </div>
        </div>

        {/* Field Position */}
        <div style={{
          background: 'rgba(100, 255, 100, 0.1)',
          border: '1px solid rgba(100, 255, 100, 0.3)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <div style={{
            color: '#64FF64',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🏏 Field Location
          </div>
          <div style={{ fontSize: '12px' }}>
            <div style={{ marginBottom: '6px' }}>
              <span style={{ color: '#64FF64' }}>Side:</span>
              <span style={{ color: 'white', marginLeft: '8px' }}>
                {ballPosition[0] > 5 ? '➡️ Off Side' : 
                 ballPosition[0] < -5 ? '⬅️ Leg Side' : '📍 Straight'}
              </span>
            </div>
            <div style={{ marginBottom: '6px' }}>
              <span style={{ color: '#64FF64' }}>Length:</span>
              <span style={{ color: 'white', marginLeft: '8px' }}>
                {ballPosition[2] > 10 ? '🔵 Behind Bowler' :
                 ballPosition[2] > -5 ? '🟡 Good Length' : '🔴 Behind Batsman'}
              </span>
            </div>
            <div>
              <span style={{ color: '#64FF64' }}>Boundary:</span>
              <span style={{ color: 'white', marginLeft: '8px' }}>
                {distanceFromStriker > 45 ? '🎯 Near Boundary' :
                 distanceFromStriker > 30 ? '🟡 Deep Field' : '🟢 Inside Circle'}
              </span>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div style={{
          borderTop: '1px solid rgba(255, 102, 0, 0.3)',
          paddingTop: '10px',
          marginTop: '15px',
          fontSize: '10px',
          color: '#666',
          textAlign: 'center'
        }}>
          📍 Real-time ball position tracking
        </div>
      </div>
    </div>
  );

  // Render the panel as a portal to document.body to escape the 3D Canvas context
  return createPortal(panelContent, document.body);
};

export default LeftDockedPanel;
