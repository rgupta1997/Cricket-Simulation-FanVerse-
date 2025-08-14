import React from 'react';

// Pure component for displaying keyboard instructions
const Instructions = ({ views, showGameInstructions }) => (
  <div className="instructions">
    <h3>Camera Controls</h3>
    {views.map(view => (
      <div key={view.key}>
        Press <strong>{view.key}</strong> - {view.name}
      </div>
    ))}
    
    {showGameInstructions && (
      <>
        <h3 style={{ marginTop: '20px' }}>🏏 Cricket Simulation Game</h3>
        
        <h4>Bowling Controls</h4>
        <div>Press <strong>SPACEBAR</strong> - Bowl the ball</div>
        <div>Press <strong>1</strong> - Switch to bowling mode</div>
        
        <h4>Batting Controls</h4>
        <div>Press <strong>D</strong> - Defensive shot</div>
        <div>Press <strong>F</strong> - Drive shot</div>
        <div>Press <strong>G</strong> - Pull shot</div>
        <div>Press <strong>H</strong> - Cut shot</div>
        <div>Press <strong>V</strong> - Loft shot</div>
        <div>Press <strong>2</strong> - Switch to batting mode</div>
        
        <h4>Fielding Controls</h4>
        <div>Press <strong>T</strong> - Throw ball to keeper</div>
        <div>Press <strong>3</strong> - Switch to fielding mode</div>
        
        <h4>General Controls</h4>
        <div>Press <strong>P</strong> - Pause/Resume game</div>
        <div>Press <strong>C</strong> - Switch stadium model</div>
        
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
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
        <h3 style={{ marginTop: '20px' }}>Player Controls</h3>
        <div>Press <strong>B</strong> - Select Bowler (↑↓ to move)</div>
        <div>Press <strong>S</strong> - Select Striker (←→ to move)</div>
        <div>Press <strong>N</strong> - Select Non-Striker (←→ to move)</div>
        <div>Press <strong>R</strong> - Reset positions</div>
        <div>Press <strong>C</strong> - Switch stadium model</div>
      </>
    )}
  </div>
);

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