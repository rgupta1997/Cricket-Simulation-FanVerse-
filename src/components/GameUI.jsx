/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

// Game UI Component (HTML overlay) - renders outside Canvas
const GameUI = ({ 
  gameData
}) => {
  const [accordionState, setAccordionState] = useState({
    score: true,
    controls: true,
    gameState: false,
    shotInfo: true
  });

  const toggleAccordion = (section) => {
    setAccordionState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
      {/* Score Display Accordion */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '6px',
        pointerEvents: 'auto',
        fontSize: '12px',
        fontFamily: 'monospace',
        minWidth: '150px'
      }}>
        <div 
          onClick={() => toggleAccordion('score')}
          style={{
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: accordionState.score ? '1px solid #555' : 'none'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', color: '#4CAF50' }}>Score</h3>
          <span style={{ fontSize: '16px', transition: 'transform 0.3s ease', transform: accordionState.score ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
        {accordionState.score && (
          <div style={{ padding: '10px', paddingTop: '5px' }}>
            <div style={{ marginBottom: '2px' }}>Runs: {score.runs}</div>
            <div style={{ marginBottom: '2px' }}>Wickets: {score.wickets}</div>
            <div>Overs: {Math.floor(score.balls / 6)}.{score.balls % 6}</div>
          </div>
        )}
      </div>

      {/* Shot Information Accordion */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,30,0.9) 100%)',
        borderRadius: '30px',
        pointerEvents: 'auto',
        minWidth: '300px'
      }}>
        <div 
          onClick={() => toggleAccordion('shotInfo')}
          style={{
            padding: '12px 25px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: accordionState.shotInfo ? '1px solid #555' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFFFFF' }}>
              Shot Information
            </div>
          </div>
          <span style={{ fontSize: '16px', transition: 'transform 0.3s ease', transform: accordionState.shotInfo ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
        {accordionState.shotInfo && (
          <div style={{ padding: '12px 25px', paddingTop: '5px' }}>
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
        )}
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

      {/* Game State Accordion */}
      <div style={{
        position: 'absolute',
        top: accordionState.score ? '140px' : '80px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '6px',
        pointerEvents: 'auto',
        fontSize: '11px',
        fontFamily: 'monospace',
        minWidth: '150px'
      }}>
        <div 
          onClick={() => toggleAccordion('gameState')}
          style={{
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: accordionState.gameState ? '1px solid #555' : 'none'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '12px', color: '#FFC107' }}>Game Status</h3>
          <span style={{ fontSize: '14px', transition: 'transform 0.3s ease', transform: accordionState.gameState ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
        {accordionState.gameState && (
          <div style={{ padding: '8px', paddingTop: '5px' }}>
            <div style={{ marginBottom: '2px', color: '#FFC107' }}>Status: {currentGameState.replace('_', ' ').toUpperCase()}</div>
            <div>Playing: {isPlaying ? '✓' : '✗'}</div>
          </div>
        )}
      </div>

      {/* Position Editor Toggle Button */}
      {gameData.togglePositionEditor && (
        <div style={{
          position: 'absolute',
          top: '140px',
          right: '20px',
          pointerEvents: 'auto'
        }}>
          <button
            onClick={gameData.togglePositionEditor}
            style={{
              background: gameData.showPositionEditor 
                ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' 
                : 'linear-gradient(135deg, #4CAF50 0%, #388e3c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '12px 20px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            }}
          >
            <span style={{ fontSize: '16px' }}>
              {gameData.showPositionEditor ? '⚙️' : '🏟️'}
            </span>
            {gameData.showPositionEditor ? 'Close Editor' : 'Edit Positions'}
          </button>
        </div>
      )}

      {/* Controls Panel Accordion */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '6px',
        pointerEvents: 'auto',
        minWidth: '220px',
        fontSize: '11px',
        fontFamily: 'monospace'
      }}>
        <div 
          onClick={() => toggleAccordion('controls')}
          style={{
            padding: '12px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: accordionState.controls ? '1px solid #555' : 'none'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '13px', color: '#4CAF50' }}>Game Controls</h3>
          <span style={{ fontSize: '16px', transition: 'transform 0.3s ease', transform: accordionState.controls ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
        {accordionState.controls && (
          <div style={{ padding: '12px', paddingTop: '5px' }}>
            {selectedControl === 'bowling' && (
              <div>
                <h4 style={{ margin: '6px 0 4px 0', fontSize: '11px', color: '#FFC107' }}>Bowling Controls</h4>
                
                {/* Speed Control */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', color: '#888' }}>Speed (km/h)</label>
                  <input 
                    type="range" 
                    min="100" 
                    max="150" 
                    value={controls.bowling.speed} 
                    onChange={(e) => gameData.onBowlingControlChange?.('speed', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#4CAF50'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                    <span>100</span>
                    <span>{controls.bowling.speed}</span>
                    <span>150</span>
                  </div>
                </div>

                {/* Line Control */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', color: '#888' }}>Line</label>
                  <input 
                    type="range" 
                    min="-1" 
                    max="1" 
                    step="0.1"
                    value={controls.bowling.line} 
                    onChange={(e) => gameData.onBowlingControlChange?.('line', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#4CAF50'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                    <span>Off</span>
                    <span>{controls.bowling.line.toFixed(1)}</span>
                    <span>Leg</span>
                  </div>
                </div>

                {/* Length Control */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', color: '#888' }}>Length</label>
                  <input 
                    type="range" 
                    min="-1" 
                    max="1" 
                    step="0.1"
                    value={controls.bowling.length} 
                    onChange={(e) => gameData.onBowlingControlChange?.('length', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#4CAF50'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                    <span>Short</span>
                    <span>{controls.bowling.length.toFixed(1)}</span>
                    <span>Full</span>
                  </div>
                </div>

                {/* Pitch Control */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', color: '#888' }}>Pitch</label>
                  <input 
                    type="range" 
                    min="-1" 
                    max="1" 
                    step="0.1"
                    value={controls.bowling.pitch || 0} 
                    onChange={(e) => gameData.onBowlingControlChange?.('pitch', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#4CAF50'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                    <span>Left</span>
                    <span>{(controls.bowling.pitch || 0).toFixed(1)}</span>
                    <span>Right</span>
                  </div>
                </div>

                {/* Bounce Height Control */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', color: '#888' }}>Pitch Bounce</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="4" 
                    step="0.2"
                    value={controls.bowling.bounceHeight || 0.5} 
                    onChange={(e) => gameData.onBowlingControlChange?.('bounceHeight', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#4CAF50'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                    <span>Dead</span>
                    <span>{(controls.bowling.bounceHeight || 0.5).toFixed(1)}</span>
                    <span>WACA</span>
                  </div>
                  <div style={{ fontSize: '8px', color: '#666', textAlign: 'center', marginTop: '2px' }}>
                    Pitch characteristics: 0 = Dead pitch, 2 = Normal, 4 = Very bouncy
                  </div>
                </div>

                <div style={{ marginBottom: '2px', marginTop: '10px' }}><span style={{ fontWeight: 'bold' }}>SPACEBAR</span> - Bowl</div>
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
              <div style={{ marginBottom: '2px' }}><span style={{ fontWeight: 'bold' }}>Shift+E</span> - Position Editor</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameUI;