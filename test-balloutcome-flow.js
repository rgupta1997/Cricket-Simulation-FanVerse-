// Test script to verify BallOutcome system flow
console.log('🎮 Testing BallOutcome System Flow...');

// Simulate the game state
let gameState = {
  BallOutcome: null,
  lastAction: null,
  currentBall: null
};

// Simulate the deterministic target (from logs)
const deterministicTarget = {
  exactDistance: 20,
  angle: 330,
  finalStopPosition: [17.3, 1.0, 1.0]
};

// Simulate the shot completion logic
function simulateShotCompletion() {
  console.log('🎯 Simulating shot completion...');
  
  const shotDistance = deterministicTarget.exactDistance;
  console.log(`📏 Shot distance: ${shotDistance}m`);
  
  // Determine runs based on shot distance (same logic as in the game)
  let runs = 0;
  let description = '';
  let outcomeType = 'shot';
  
  if (shotDistance >= 50) {
    runs = 6;
    description = 'Hit over the boundary for six';
    outcomeType = 'boundary';
  } else if (shotDistance >= 40) {
    runs = 4;
    description = 'Driven through covers for four';
    outcomeType = 'boundary';
  } else if (shotDistance >= 25) {
    runs = 3;
    description = 'Well placed for three runs';
  } else if (shotDistance >= 15) {
    runs = 2;
    description = 'Good running between the wickets for two';
  } else if (shotDistance >= 8) {
    runs = 1;
    description = 'Quick single taken';
  } else {
    runs = 0;
    description = 'Defended back to the bowler';
  }
  
  console.log(`🏏 Determined outcome: ${runs} runs, ${description}`);
  
  // Set BallOutcome
  gameState.BallOutcome = {
    type: outcomeType,
    runs: runs,
    description: description
  };
  
  console.log('✅ BallOutcome set:', gameState.BallOutcome);
}

// Simulate the graphics trigger logic
function simulateGraphicsTrigger() {
  console.log('🎮 Simulating graphics trigger...');
  
  const ballOutcome = gameState.BallOutcome;
  const lastAction = gameState.lastAction;
  const currentBall = gameState.currentBall;
  
  console.log('🎮 Available data:', { 
    ballOutcome: ballOutcome ? JSON.stringify(ballOutcome) : 'null', 
    lastAction: lastAction ? JSON.stringify(lastAction) : 'null', 
    currentBall: currentBall ? JSON.stringify(currentBall) : 'null' 
  });
  
  if (ballOutcome && ballOutcome.type) {
    // Use BallOutcome data as primary source
    const outcomeData = {
      runs: ballOutcome.runs || 0,
      isBoundary: ballOutcome.type === 'boundary' || false,
      details: ballOutcome.description || "",
      type: ballOutcome.type
    };
    
    console.log('🎮 Triggering ball outcome graphics from BallOutcome:', outcomeData);
    return outcomeData;
  } else if (lastAction) {
    // Fallback to lastAction data
    const outcomeData = {
      runs: lastAction.runs || 0,
      isBoundary: lastAction.type === 'boundary' || false,
      details: lastAction.description || ""
    };
    
    if (outcomeData.runs > 0 || outcomeData.details) {
      console.log('🎮 Triggering ball outcome graphics from lastAction:', outcomeData);
      return outcomeData;
    } else {
      console.log('🎮 Skipping graphics - incomplete lastAction data:', outcomeData);
      return null;
    }
  } else {
    console.log('🎮 No data available for graphics');
    return null;
  }
}

// Test the flow
console.log('\n=== Test 1: Normal Flow ===');
simulateShotCompletion();
const result1 = simulateGraphicsTrigger();
console.log('Result 1:', result1);

console.log('\n=== Test 2: BallOutcome null (should fallback) ===');
gameState.BallOutcome = null;
gameState.lastAction = {
  type: 'boundary',
  runs: 4,
  description: 'Driven through covers for four'
};
const result2 = simulateGraphicsTrigger();
console.log('Result 2:', result2);

console.log('\n=== Test 3: Both null (should skip) ===');
gameState.BallOutcome = null;
gameState.lastAction = null;
const result3 = simulateGraphicsTrigger();
console.log('Result 3:', result3);

console.log('\n=== Test 4: Incomplete lastAction (should skip) ===');
gameState.lastAction = {
  type: 'shot',
  shotType: 'drive',
  source: 'auto-shot'
  // Missing runs and description
};
const result4 = simulateGraphicsTrigger();
console.log('Result 4:', result4);

console.log('\n🎮 BallOutcome System Flow Test Complete!');
