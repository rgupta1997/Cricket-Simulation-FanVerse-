import { useState } from 'react';
import { createPortal } from 'react-dom';
import CricketUIAccordion from './CricketUIAccordion';
import CompactAccordion from './CompactAccordion';

const RightDockedPanel = ({
  useCompactUI,
  setUseCompactUI,
  gameState,
  handleBowlingConfigUpdate,
  handleBallShotConfigUpdate,
  resetBallToBowler,
  showPitchMarkers,
  setShowPitchMarkers,
  showCoordinateDisplay,
  setShowCoordinateDisplay,
  showPitchGrid,
  setShowPitchGrid,
  currentView,
  switchToView,
  // Ball following props
  isFollowingBall = false,
  ballFollowConfig = {},
  handleBallFollowToggle = () => {},
  handleBallFollowConfigUpdate = () => {},
  // Demo data props
  isDummyDataActive = false,
  onLoadDummyData = () => {},
  onClearDummyData = () => {}
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const panelContent = (
    <div style={{
      position: 'fixed',
      top: '0',
      right: '0',
      width: isCollapsed ? '50px' : '400px',
      height: '100vh',
      transition: 'width 0.3s ease-in-out',
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
        borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 215, 0, 0.3)',
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
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFD700',
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
            right: isCollapsed ? '10px' : '0',
            top: isCollapsed ? '10px' : '0',
            zIndex: 1001,
            ':hover': {
              backgroundColor: 'rgba(255, 215, 0, 0.1)'
            }
          }}
        >
          {isCollapsed ? '⮞' : '⮜'}
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

        {/* Main UI Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginTop: '15px'
        }}>
          {useCompactUI ? (
            <CompactAccordion 
              gameState={gameState}
              onBowlingConfigUpdate={handleBowlingConfigUpdate}
              onBallShotConfigUpdate={handleBallShotConfigUpdate}
              resetBallToBowler={resetBallToBowler}
              showPitchMarkers={showPitchMarkers}
              setShowPitchMarkers={setShowPitchMarkers}
              showCoordinateDisplay={showCoordinateDisplay}
              setShowCoordinateDisplay={setShowCoordinateDisplay}
              showGrid={showPitchGrid}
              setShowGrid={setShowPitchGrid}
              currentCameraView={currentView}
              onCameraViewChange={switchToView}
              isFollowingBall={isFollowingBall || false}
              ballFollowConfig={ballFollowConfig || {}}
              onBallFollowToggle={handleBallFollowToggle || (() => {})}
              onBallFollowConfigUpdate={handleBallFollowConfigUpdate || (() => {})}
              isDummyDataActive={isDummyDataActive}
              onLoadDummyData={onLoadDummyData}
              onClearDummyData={onClearDummyData}
            />
          ) : (
            <CricketUIAccordion 
              gameState={gameState}
              onBowlingConfigUpdate={handleBowlingConfigUpdate}
              onBallShotConfigUpdate={handleBallShotConfigUpdate}
              showPitchMarkers={showPitchMarkers}
              setShowPitchMarkers={setShowPitchMarkers}
              showCoordinateDisplay={showCoordinateDisplay}
              setShowCoordinateDisplay={setShowCoordinateDisplay}
              showPitchGrid={showPitchGrid}
              setShowPitchGrid={setShowPitchGrid}
              currentCameraView={currentView}
              onCameraViewChange={switchToView}
              isFollowingBall={isFollowingBall || false}
              ballFollowConfig={ballFollowConfig || {}}
              onBallFollowToggle={handleBallFollowToggle || (() => {})}
              onBallFollowConfigUpdate={handleBallFollowConfigUpdate || (() => {})}
              isDummyDataActive={isDummyDataActive}
              onLoadDummyData={onLoadDummyData}
              onClearDummyData={onClearDummyData}
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
    </div>
  );

  // Render the panel as a portal to document.body to escape the 3D Canvas context
  return createPortal(panelContent, document.body);
};

export default RightDockedPanel;
