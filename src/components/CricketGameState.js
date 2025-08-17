// Cricket Game State Management System
// Handles all game logic, player states, and ball physics

export const GAME_STATES = {
  WAITING_FOR_BALL: 'waiting_for_ball',
  BOWLING: 'bowling',
  BALL_IN_PLAY: 'ball_in_play',
  FIELDING: 'fielding',
  THROWING_BACK: 'throwing_back',
  CELEBRATION: 'celebration'
};

export const PLAYER_STATES = {
  IDLE: 'idle',
  READY: 'ready',
  BOWLING: 'bowling',
  BATTING: 'batting',
  RUNNING: 'running',
  FIELDING: 'fielding',
  CELEBRATING: 'celebrating'
};

export const BALL_STATES = {
  WITH_BOWLER: 'with_bowler',
  BOWLING: 'bowling',
  BOUNCING: 'bouncing',
  HIT: 'hit',
  CAUGHT: 'caught',
  WITH_FIELDER: 'with_fielder',
  RETURNING: 'returning',
  WITH_KEEPER: 'with_keeper'
};

// Initial game state
export const createInitialGameState = () => ({
  gameState: GAME_STATES.WAITING_FOR_BALL,
  ballState: BALL_STATES.WITH_BOWLER,
  canBat: false, // Batting only allowed when ball is near striker
  score: {
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0
  },
  currentBall: {
    position: [0, 0.5, 15],  // Ball starts at bowler's new position
    velocity: [0, 0, 0],
    isMoving: false,
    trajectory: []
  },
  players: {
    striker: {
      id: 'striker',
      position: [0, 0, -9],  // Centered in front of stumps
      state: PLAYER_STATES.READY,
      isOnStrike: true,
      animation: null
    },
    nonStriker: {
      id: 'non_striker',
      position: [1.5, 0, 9],  // Swapped with striker
      state: PLAYER_STATES.IDLE,
      isOnStrike: false,
      animation: null
    },
    bowler: {
      id: 'bowler',
      position: [0, 0, 15],  // Bowler at far end
      state: PLAYER_STATES.READY,
      animation: null,
      runUpDistance: 0
    },
    wicketKeeper: {
      id: 'wicket_keeper',
      position: [0, 0, -11],  // Behind new striker position
      state: PLAYER_STATES.READY,
      animation: null
    },
    umpires: {
      bowlersEnd: {
        id: 'bowlers_end_umpire',
        position: [0, 0, 11],  // Behind bowler (swapped)
        state: PLAYER_STATES.IDLE
      },
      point: {
        id: 'point_umpire',
        position: [12, 0, -8],  // Point position relative to new striker
        state: PLAYER_STATES.IDLE
      }
    },
    fielders: []
  },
  lastAction: null,
  animations: {
    active: [],
    queue: []
  },
  controls: {
    bowling: {
      speed: 120,
      line: 0,
      length: 0,
      pitch: 0,
      bounceHeight: 0.5  // 0 to 1, controls how high the ball bounces relative to batsman height
    },
    batting: {
      footwork: 'front',
      shot: 'defensive',
      timing: 1.0
    },
    fielding: {
      selectedFielder: null,
      throwTarget: 'keeper'
    }
  }
});

// Game state update functions
export const updateGameState = (currentState, action) => {
  switch (action.type) {
    case 'START_BOWLING':
      return {
        ...currentState,
        gameState: GAME_STATES.BOWLING,
        ballState: BALL_STATES.BOWLING,
        canBat: false, // Reset batting availability when bowling starts
        players: {
          ...currentState.players,
          bowler: {
            ...currentState.players.bowler,
            state: PLAYER_STATES.BOWLING
          }
        }
      };

    case 'BALL_BOWLED':
      return {
        ...currentState,
        gameState: GAME_STATES.BALL_IN_PLAY,
        ballState: BALL_STATES.BOWLING,
        currentBall: {
          ...action.ballData,
          isMoving: true
        },
        players: {
          ...currentState.players,
          striker: {
            ...currentState.players.striker,
            state: PLAYER_STATES.BATTING
          }
        }
      };

    case 'BALL_HIT':
      const hitVelocity = action.newVelocity || action.payload?.newVelocity || [0, 5, 10];
      return {
        ...currentState,
        ballState: BALL_STATES.HIT,
        canBat: false, // Disable batting after hitting the ball
        currentBall: {
          ...currentState.currentBall,
          velocity: hitVelocity,
          trajectory: action.trajectory || action.payload?.trajectory,
          isMoving: true
        },
        lastAction: {
          type: 'shot',
          shotType: action.shotType || action.payload?.shotType,
          power: action.power || action.payload?.power
        },
        players: {
          ...currentState.players,
          striker: {
            ...currentState.players.striker,
            state: action.isRunnable ? PLAYER_STATES.RUNNING : PLAYER_STATES.IDLE,
            animation: 'batting'
          },
          nonStriker: {
            ...currentState.players.nonStriker,
            state: action.isRunnable ? PLAYER_STATES.RUNNING : PLAYER_STATES.IDLE
          }
        }
      };

    case 'BALL_FIELDED':
      return {
        ...currentState,
        gameState: GAME_STATES.FIELDING,
        ballState: BALL_STATES.WITH_FIELDER,
        currentBall: {
          ...currentState.currentBall,
          position: action.fielderPosition,
          isMoving: false
        }
      };

    case 'BALL_THROWN':
      return {
        ...currentState,
        gameState: GAME_STATES.THROWING_BACK,
        ballState: BALL_STATES.RETURNING,
        currentBall: {
          ...currentState.currentBall,
          velocity: action.throwVelocity,
          isMoving: true
        }
      };

    case 'BALL_WITH_KEEPER':
      return {
        ...currentState,
        gameState: GAME_STATES.WAITING_FOR_BALL,
        ballState: BALL_STATES.WITH_KEEPER,
        canBat: false, // Reset batting availability when ball returns to keeper
        currentBall: {
          position: currentState.players.wicketKeeper.position,
          velocity: [0, 0, 0],
          isMoving: false,
          trajectory: []
        },
        players: {
          ...currentState.players,
          striker: {
            ...currentState.players.striker,
            state: PLAYER_STATES.READY
          },
          nonStriker: {
            ...currentState.players.nonStriker,
            state: PLAYER_STATES.IDLE
          },
          bowler: {
            ...currentState.players.bowler,
            state: PLAYER_STATES.READY
          }
        }
      };

    case 'UPDATE_SCORE':
      return {
        ...currentState,
        score: {
          ...currentState.score,
          ...action.scoreUpdate
        }
      };

    case 'SWAP_BATSMEN':
      const { striker, nonStriker } = currentState.players;
      return {
        ...currentState,
        players: {
          ...currentState.players,
          striker: {
            ...nonStriker,
            id: 'striker',
            isOnStrike: true,
            state: PLAYER_STATES.READY
          },
          nonStriker: {
            ...striker,
            id: 'non_striker',
            isOnStrike: false,
            state: PLAYER_STATES.IDLE
          }
        }
      };

    case 'UPDATE_BALL_POSITION':
      return {
        ...currentState,
        currentBall: {
          ...currentState.currentBall,
          position: action.position,
          velocity: action.velocity || currentState.currentBall.velocity
        }
      };

    case 'UPDATE_PLAYER_POSITION':
      return {
        ...currentState,
        players: {
          ...currentState.players,
          [action.playerId]: {
            ...currentState.players[action.playerId],
            position: action.position
          }
        }
      };

    case 'SET_PLAYER_ANIMATION':
      return {
        ...currentState,
        players: {
          ...currentState.players,
          [action.playerId]: {
            ...currentState.players[action.playerId],
            animation: action.animation,
            state: action.state || currentState.players[action.playerId].state
          }
        }
      };

    case 'UPDATE_CONTROLS':
      return {
        ...currentState,
        controls: {
          ...currentState.controls,
          [action.controlType]: {
            ...currentState.controls[action.controlType],
            ...action.updates
          }
        }
      };

    default:
      return currentState;
  }
};

// Ball physics calculations
export const calculateBallTrajectory = (bowlingSpeed, line, length, pitch) => {
  const speedMS = (bowlingSpeed * 1000) / 3600; // Convert km/h to m/s
  const gravity = -9.81;
  
  // Line is already in range -1 to 1
  const targetX = line * 2; // Scale up for more pronounced movement
  
  // Length is in range -1 to 1, convert to appropriate pitch length
  const targetZ = 6 + (length * 3); // 3-9 meters from batsman
  const pitchDistance = 20; // Distance from bowler to batsman
  
  // Calculate initial velocity components
  const angle = Math.atan2(0.5, pitchDistance); // Ball release height to bounce point
  const initialVelocityZ = speedMS * Math.cos(angle);
  const initialVelocityY = speedMS * Math.sin(angle);
  const initialVelocityX = (targetX / pitchDistance) * speedMS;
  
  return {
    initial: {
      position: [0, 2, -15], // Bowler's release point
      velocity: [initialVelocityX, initialVelocityY, initialVelocityZ]
    },
    target: {
      position: [targetX, 0, targetZ]
    },
    bouncePoint: {
      position: [targetX * 0.7, 0, targetZ]
    }
  };
};

// Batting response calculations
export const calculateBattingResponse = (ballPosition, ballVelocity, shotType, timing, footwork) => {
  const shotPower = {
    'defensive': 0.2,
    'drive': 0.8,
    'cut': 0.7,
    'pull': 0.9,
    'sweep': 0.6,
    'loft': 1.0
  };
  
  const shotAngle = {
    'defensive': { horizontal: 0, vertical: -10 },
    'drive': { horizontal: 0, vertical: 10 },
    'cut': { horizontal: 60, vertical: 15 },
    'pull': { horizontal: -60, vertical: 20 },
    'sweep': { horizontal: -45, vertical: 5 },
    'loft': { horizontal: 0, vertical: 45 }
  };
  
  const power = (shotPower[shotType] || 0.5) * timing;
  const angle = shotAngle[shotType] || { horizontal: 0, vertical: 10 };
  
  // Calculate new ball velocity after bat contact
  const ballSpeed = Math.sqrt(
    ballVelocity[0] ** 2 + ballVelocity[1] ** 2 + ballVelocity[2] ** 2
  );
  
  const newSpeed = ballSpeed * power;
  const horizontalAngleRad = (angle.horizontal * Math.PI) / 180;
  const verticalAngleRad = (angle.vertical * Math.PI) / 180;
  
  const newVelocity = [
    newSpeed * Math.sin(horizontalAngleRad),
    newSpeed * Math.sin(verticalAngleRad),
    newSpeed * Math.cos(horizontalAngleRad) * Math.cos(verticalAngleRad)
  ];
  
  // Determine if it's a runnable shot
  const isRunnable = power > 0.3 && angle.vertical < 30;
  const isBoundary = power > 0.7;
  
  return {
    newVelocity,
    isRunnable,
    isBoundary,
    shotType,
    timing,
    expectedRuns: isBoundary ? (angle.vertical > 20 ? 6 : 4) : (isRunnable ? 1 : 0)
  };
};

// Fielding calculations
export const findNearestFielder = (ballPosition, fielders) => {
  let nearest = null;
  let minDistance = Infinity;
  
  fielders.forEach((fielder, index) => {
    const distance = Math.sqrt(
      (ballPosition[0] - fielder.position[0]) ** 2 +
      (ballPosition[2] - fielder.position[2]) ** 2
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...fielder, index, distance };
    }
  });
  
  return nearest;
};

// Animation queue management
export const queueAnimation = (currentState, playerId, animationType, duration = 1000) => {
  return {
    ...currentState,
    animations: {
      ...currentState.animations,
      queue: [
        ...currentState.animations.queue,
        {
          id: `${playerId}_${animationType}_${Date.now()}`,
          playerId,
          type: animationType,
          duration,
          startTime: null
        }
      ]
    }
  };
};