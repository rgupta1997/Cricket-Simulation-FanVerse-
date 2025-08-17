import React from 'react';
import { createPortal } from 'react-dom';
import CricketUIAccordion from './CricketUIAccordion';
import CompactAccordion from './CompactAccordion';
import UIToggleButton from './UIToggleButton';

const RightDockedPanel = ({
  useCompactUI,
  setUseCompactUI,
  gameState,
  handleBowlingConfigUpdate,
  showPitchMarkers,
  setShowPitchMarkers,
  showCoordinateDisplay,
  setShowCoordinateDisplay,
  showPitchGrid,
  setShowPitchGrid,
  currentView,
  switchToView
}) => {
  const panelContent = (
    <div style={{
      position: 'fixed',
      top: '0',
      right: '0',
      width: '400px',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      borderLeft: '2px solid rgba(255, 215, 0, 0.3)',
      zIndex: 1000,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '10px',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Panel Header */}
      <div style={{
        borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
        paddingBottom: '10px',
        marginBottom: '15px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <h2 style={{
            color: '#FFD700',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🎯 Ball Trajectory Details
          </h2>
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#FFD700',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            DOCKED
          </div>
        </div>
        <div style={{
          color: '#aaa',
          fontSize: '12px',
          marginBottom: '10px'
        }}>
          🏏 Cricket Controls
        </div>
        
        {/* UI Mode Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '8px'
        }}>
          <span style={{ color: '#ccc', fontSize: '12px' }}>Interface:</span>
          <button
            onClick={() => setUseCompactUI(!useCompactUI)}
            style={{
              padding: '4px 12px',
              background: useCompactUI ? 'rgba(0, 200, 0, 0.2)' : 'rgba(200, 0, 0, 0.2)',
              border: `1px solid ${useCompactUI ? '#00AA00' : '#AA0000'}`,
              color: useCompactUI ? '#00FF00' : '#FF4444',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = useCompactUI ? 'rgba(0, 200, 0, 0.3)' : 'rgba(200, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = useCompactUI ? 'rgba(0, 200, 0, 0.2)' : 'rgba(200, 0, 0, 0.2)';
            }}
          >
            {useCompactUI ? '📱 Compact' : '🖥️ Full'}
          </button>
        </div>
      </div>

      {/* Main UI Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {useCompactUI ? (
          <CompactAccordion 
            gameState={gameState}
            onBowlingConfigUpdate={handleBowlingConfigUpdate}
            showPitchMarkers={showPitchMarkers}
            setShowPitchMarkers={setShowPitchMarkers}
            showCoordinateDisplay={showCoordinateDisplay}
            setShowCoordinateDisplay={setShowCoordinateDisplay}
            showGrid={showPitchGrid}
            setShowGrid={setShowPitchGrid}
            currentCameraView={currentView}
            onCameraViewChange={switchToView}
          />
        ) : (
          <CricketUIAccordion 
            gameState={gameState}
            onBowlingConfigUpdate={handleBowlingConfigUpdate}
            showPitchMarkers={showPitchMarkers}
            setShowPitchMarkers={setShowPitchMarkers}
            showCoordinateDisplay={showCoordinateDisplay}
            setShowCoordinateDisplay={setShowCoordinateDisplay}
            showPitchGrid={showPitchGrid}
            setShowPitchGrid={setShowPitchGrid}
            currentCameraView={currentView}
            onCameraViewChange={switchToView}
          />
        )}
      </div>

      {/* Panel Footer */}
      <div style={{
        borderTop: '1px solid rgba(255, 215, 0, 0.3)',
        paddingTop: '10px',
        marginTop: '15px',
        fontSize: '10px',
        color: '#666',
        textAlign: 'center'
      }}>
        🎮 Use controls above to configure ball trajectory
      </div>
    </div>
  );

  // Render the panel as a portal to document.body to escape the 3D Canvas context
  return createPortal(panelContent, document.body);
};

export default RightDockedPanel;
