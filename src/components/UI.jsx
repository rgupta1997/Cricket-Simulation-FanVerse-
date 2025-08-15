import React, { useState } from 'react';

// Pure component for displaying keyboard instructions
const Instructions = ({ views, showGameInstructions }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const containerStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '10px',
    fontFamily: 'Arial, sans-serif',
    zIndex: 1000,
    minWidth: '300px',
    color: 'white'
  };

  const headerStyle = {
    padding: '15px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: isExpanded ? '1px solid #555' : 'none'
  };

  const contentStyle = {
    padding: '15px',
    paddingTop: '5px'
  };

  return (
    <div style={containerStyle}>
      <div 
        style={headerStyle}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 style={{ margin: 0, fontSize: '16px', color: '#4CAF50' }}>
          {showGameInstructions ? '🏏 Game Instructions' : '📋 Controls'}
        </h3>
        <span style={{ 
          fontSize: '16px', 
          transition: 'transform 0.3s ease', 
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' 
        }}>
          ▼
        </span>
      </div>
      
      {isExpanded && (
        <div style={contentStyle}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#FFC107' }}>Camera Controls</h4>
          {views.map(view => (
            <div key={view.key} style={{ marginBottom: '5px', fontSize: '12px' }}>
              Press <strong>{view.key}</strong> - {view.name}
            </div>
          ))}
          
          {showGameInstructions && (
            <>
              <h4 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '14px', color: '#FFC107' }}>Bowling Controls</h4>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>SPACEBAR</strong> - Bowl the ball</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>1</strong> - Switch to bowling mode</div>
              
              <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '14px', color: '#FFC107' }}>Batting Controls</h4>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>D</strong> - Defensive shot</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>F</strong> - Drive shot</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>G</strong> - Pull shot</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>H</strong> - Cut shot</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>V</strong> - Loft shot</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>2</strong> - Switch to batting mode</div>
              
              <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '14px', color: '#FFC107' }}>Fielding Controls</h4>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>T</strong> - Throw ball to keeper</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>3</strong> - Switch to fielding mode</div>
              
              <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '14px', color: '#FFC107' }}>General Controls</h4>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>P</strong> - Pause/Resume game</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>C</strong> - Switch stadium model</div>
              
              <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', fontSize: '11px' }}>
                <strong>Game Features:</strong><br/>
                • Full cricket simulation with striker, non-striker, bowler, keeper<br/>
                • Two umpires positioned correctly<br/>
                • Realistic ball physics and player animations<br/>
                • Complete batting, bowling, and fielding controls<br/>
                • Score tracking and game state management<br/>
              </div>
            </>
          )}
          
          {!showGameInstructions && (
            <>
              <h4 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '14px', color: '#FFC107' }}>Player Controls</h4>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>B</strong> - Select Bowler (↑↓ to move)</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>S</strong> - Select Striker (←→ to move)</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>N</strong> - Select Non-Striker (←→ to move)</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>R</strong> - Reset positions</div>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Press <strong>C</strong> - Switch stadium model</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Pure component for displaying current view
const CurrentViewDisplay = ({ viewName }) => (
  <div className="current-view">
    {viewName}
  </div>
);

// Main UI component
const UI = ({ currentView, availableViews, showGameInstructions = false }) => {
  return (
    <>
      <Instructions views={availableViews} showGameInstructions={showGameInstructions} />
      <CurrentViewDisplay viewName={currentView.name} />
    </>
  );
};

export default UI;