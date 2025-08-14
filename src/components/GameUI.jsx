import React from 'react';

// Game UI Component (HTML overlay) - renders outside Canvas
const GameUI = ({ 
  gameData
}) => {
  if (!gameData || !gameData.gameState) {
    return null;
  }

  const { gameState, selectedControl, isPlaying } = gameData;
  const { score, controls, gameState: currentGameState } = gameState;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 100
    }}>
      {/* Score Display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        padding: '10px',
        borderRadius: '6px',
        pointerEvents: 'auto',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <h3 style={{ margin: 0, marginBottom: '6px', fontSize: '14px', color: '#4CAF50' }}>Score</h3>
        <div style={{ marginBottom: '2px' }}>Runs: {score.runs}</div>
        <div style={{ marginBottom: '2px' }}>Wickets: {score.wickets}</div>
        <div>Overs: {Math.floor(score.balls / 6)}.{score.balls % 6}</div>
      </div>

      {/* Advanced Batting Indicator */}
      <div style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        background: gameState.canBat 
          ? 'linear-gradient(135deg, rgba(0,255,0,0.9) 0%, rgba(0,200,0,0.9) 100%)' 
          : 'linear-gradient(135deg, rgba(255,0,0,0.9) 0%, rgba(200,0,0,0.9) 100%)',
        padding: '10px 20px',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: 'white',
        boxShadow: gameState.canBat ? '0 0 20px rgba(0,255,0,0.5)' : '0 0 20px rgba(255,0,0,0.3)',
        border: gameState.canBat ? '2px solid #00FF00' : '2px solid #FF0000',
        transition: 'all 0.3s ease',
        animation: gameState.canBat ? 'pulse 1s infinite' : 'none'
      }}>
        {gameState.canBat ? '⚡ HIT NOW! (SPACE)' : '⏱️ TIMING...'}
      </div>

      {/* World-Class Shot Direction Display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,30,0.9) 100%)',
        padding: '12px 25px',
        borderRadius: '30px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#FFFFFF',
        boxShadow: '0 6px 25px rgba(0,0,0,0.8)',
        border: '2px solid #00FF00',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'radial-gradient(circle, rgba(0,255,0,0.3) 0%, rgba(0,255,0,0.1) 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #00FF00',
          transform: `rotate(${gameData.shotAngle || 0}deg)`,
          transition: 'transform 0.3s ease'
        }}>
          <div style={{ fontSize: '20px', transform: `rotate(-${gameData.shotAngle || 0}deg)` }}>🏏</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Direction</div>
              <div style={{ color: '#00FF00', fontSize: '16px', textShadow: '0 0 10px rgba(0,255,0,0.5)' }}>
                {gameData.selectedDirection?.toUpperCase() || 'STRAIGHT'}
              </div>
            </div>
            <div style={{ borderLeft: '1px solid #555', paddingLeft: '15px' }}>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Shot Type</div>
              <div style={{ color: '#FFD700', fontSize: '16px', textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
                {gameData.selectedShotType?.toUpperCase() || 'DRIVE'}
              </div>
            </div>
            <div style={{ borderLeft: '1px solid #555', paddingLeft: '15px' }}>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Angle</div>
              <div style={{ color: '#FF6B6B', fontSize: '12px' }}>
                {gameData.shotAngle || 0}°
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game State */}
      <div style={{
        position: 'absolute',
        top: '180px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        padding: '8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontFamily: 'monospace'
      }}>
        <div style={{ marginBottom: '2px', color: '#FFC107' }}>Status: {currentGameState.replace('_', ' ').toUpperCase()}</div>
        <div>Playing: {isPlaying ? '✓' : '✗'}</div>
      </div>

      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        padding: '12px',
        borderRadius: '6px',
        pointerEvents: 'auto',
        minWidth: '220px',
        fontSize: '11px',
        fontFamily: 'monospace'
      }}>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '13px', color: '#4CAF50' }}>Game Controls</h3>
        
        {selectedControl === 'bowling' && (
          <div>
            <h4 style={{ margin: '6px 0 4px 0', fontSize: '11px', color: '#FFC107' }}>Bowling Controls</h4>
            <div style={{ marginBottom: '2px' }}>Speed: {controls.bowling.speed} km/h</div>
            <div style={{ marginBottom: '2px' }}>Line: {controls.bowling.line}</div>
            <div style={{ marginBottom: '2px' }}>Length: {controls.bowling.length}</div>
            <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>SPACEBAR</span> - Bowl</div>
          </div>
        )}
        
        {selectedControl === 'batting' && (
          <div>
            <h4 style={{ margin: '6px 0 4px 0', fontSize: '11px', color: '#FFC107' }}>Batting Controls</h4>
            <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>ARROWS</span> - Direction (8-way)</div>
            <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>D</span> - Defensive</div>
            <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>F</span> - Drive</div>
            <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>G</span> - Pull</div>
            <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>H</span> - Cut</div>
            <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>V</span> - Loft</div>
            <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>SPACE</span> - Execute Shot</div>
          </div>
        )}
        
        {selectedControl === 'fielding' && (
          <div>
            <h4 style={{ margin: '6px 0 4px 0', fontSize: '11px', color: '#FFC107' }}>Fielding Controls</h4>
            <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>T</span> - Throw to Keeper</div>
          </div>
        )}
        
        <div style={{ marginTop: '8px', borderTop: '1px solid #555', paddingTop: '6px' }}>
          <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>1</span> - Bowling Mode</div>
          <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>2</span> - Batting Mode</div>
          <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>3</span> - Fielding Mode</div>
          <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>P</span> - Pause/Play</div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;