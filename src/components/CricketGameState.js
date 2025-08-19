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
      velocity: 133.5,  // Ball velocity in km/h from pitch analysis
      ball_axis_x: 35.74,  // Final ball position x-coordinate
      ball_axis_y: 18.40,  // Final ball position y-coordinate (height/bounce)
      length_axis_x: 55.89,  // Bounce position x-coordinate on pitch
      length_axis_z: 8.07,   // Bounce position z-coordinate on pitch
      line_axis_x: 39.04,    // Bowler release position x-coordinate
      line_axis_z: 23.93,    // Bowler release position z-coordinate
      bounceHeight: 0.5,     // 0 to 1, controls how high the ball bounces relative to batsman height
      
      // Direct 3D World Coordinates (X, Y, Z)
      useDirectCoordinates: false,  // Toggle between pitch analysis and direct coordinates
      release_x: 0.0,      // Direct release X coordinate (meters)
      release_y: 2.0,      // Direct release Y coordinate (meters)
      release_z: 11.0,     // Direct release Z coordinate (meters)
      bounce_x: 0.0,       // Direct bounce X coordinate (meters)
      bounce_y: 0.0,       // Direct bounce Y coordinate (meters)
      bounce_z: 5.0,       // Direct bounce Z coordinate (meters)
      final_x: 0.0,        // Direct final X coordinate (meters)
      final_y: 1.2,        // Direct final Y coordinate (meters)
      final_z: -10.0,      // Direct final Z coordinate (meters - at wicket)
      
      // Legacy parameters for backward compatibility
      speed: 133.5,
      line: 0,
      length: 0,
      pitch: 0
    },
    ballShot: {
      lofted: false,              // Whether the shot is lofted or ground shot
      degree: 0,                  // Direction in degrees (0-360, 0 = straight, 90 = leg side)
      distance: 15,               // FINAL STOPPING DISTANCE in meters (0.1-40m): Where ball ends after physics
      autoPlay: false,            // Auto-trigger shot when ball reaches batsman
      power: 0.8,                 // Shot power multiplier
      timing: 1.0,                // Timing multiplier for shot quality
      keeperAutoCollect: true,    // Whether keeper should auto-collect balls
      keeperCollectionRadius: 2.0, // Distance within which keeper collects (meters)
      keeperSpeedThreshold: 3.0,  // Maximum speed for keeper to collect (m/s)
      usePhysicsMode: true        // Use physics simulation instead of direct coordinates
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

// Enhanced ball physics calculations based on pitch analysis or direct coordinates
export const calculateBallTrajectory = (bowlingControls) => {
  const { 
    velocity, 
    ball_axis_x, 
    ball_axis_y, 
    length_axis_x, 
    length_axis_z, 
    line_axis_x, 
    line_axis_z,
    useDirectCoordinates,
    release_x,
    release_y,
    release_z,
    bounce_x,
    bounce_y,
    bounce_z,
    final_x,
    final_y,
    final_z
  } = bowlingControls;
  
  const speedMS = (velocity * 1000) / 3600; // Convert km/h to m/s
  const gravity = -9.81;
  
  let releaseX, releaseY, releaseZ, bounceX, bounceY, bounceZ, finalX, finalY, finalZ;
  
  if (useDirectCoordinates) {
    // Use direct 3D world coordinates
    releaseX = release_x;
    releaseY = release_y;
    releaseZ = release_z;
    bounceX = bounce_x;
    bounceY = bounce_y;
    bounceZ = bounce_z;
    finalX = final_x;
    finalY = final_y;
    finalZ = final_z;
  } else {
    // Convert pitch analysis coordinates to 3D world coordinates
    // BOWLING: Always targets batsman position - independent of shot distance
    
    const CONVERSION_FACTOR = 0.22; // Convert analysis units to meters
    
    // Release position (where bowler releases the ball)
    releaseX = (line_axis_x - 50) * CONVERSION_FACTOR; // Center around pitch middle
    releaseY = 2.0; // Standard bowling release height
    releaseZ = 11; // Bowler's end of the pitch
    
    // Bounce position (where ball hits the pitch)
    bounceX = (length_axis_x - 50) * CONVERSION_FACTOR;
    bounceY = 0; // Ground level
    bounceZ = 11 - (length_axis_z * CONVERSION_FACTOR); // Distance from bowler end
    
    // Final position (where ball reaches after bounce) - ALWAYS at batsman for bowling
    finalX = (ball_axis_x - 50) * CONVERSION_FACTOR;
    finalY = ball_axis_y * 0.05; // Convert to meters (height is changeable)
    finalZ = -9; // FIXED: Always deliver to batsman position regardless of shot distance
  }
  
  // Calculate velocity components for release to bounce
  const releaseDistance = Math.sqrt(
    Math.pow(bounceX - releaseX, 2) + 
    Math.pow(bounceZ - releaseZ, 2)
  );
  const timeToBouncephase1 = releaseDistance / speedMS;
  
  // Initial velocity from release to bounce
  const initialVelocityX = (bounceX - releaseX) / timeToBouncephase1;
  const initialVelocityZ = (bounceZ - releaseZ) / timeToBouncephase1;
  const initialVelocityY = (releaseY + 0.5 * gravity * timeToBouncephase1 * timeToBouncephase1) / timeToBouncephase1;
  
  // Bounce velocity (after hitting the pitch)
  const bounceDistance = Math.sqrt(
    Math.pow(finalX - bounceX, 2) + 
    Math.pow(finalZ - bounceZ, 2)
  );
  const timeToBatsman = bounceDistance / (speedMS * 0.7); // Ball slows down after bounce
  
  const bounceVelocityX = (finalX - bounceX) / timeToBatsman;
  const bounceVelocityZ = (finalZ - bounceZ) / timeToBatsman;
  const bounceVelocityY = (finalY - 0.5 * gravity * timeToBatsman * timeToBatsman) / timeToBatsman;
  
  return {
    initial: {
      position: [releaseX, releaseY, releaseZ],
      velocity: [initialVelocityX, initialVelocityY, initialVelocityZ]
    },
    bounce: {
      position: [bounceX, bounceY, bounceZ],
      velocity: [bounceVelocityX, bounceVelocityY, bounceVelocityZ]
    },
    target: {
      position: [finalX, finalY, finalZ]
    },
    metadata: {
      totalTime: timeToBouncephase1 + timeToBatsman,
      bounceTime: timeToBouncephase1,
      speedMS: speedMS,
      useDirectCoordinates: useDirectCoordinates,
      pitchAnalysis: {
        ball_axis: { x: ball_axis_x, y: ball_axis_y },
        length_axis: { x: length_axis_x, z: length_axis_z },
        line_axis: { x: line_axis_x, z: line_axis_z }
      },
      directCoordinates: {
        release: { x: release_x, y: release_y, z: release_z },
        bounce: { x: bounce_x, y: bounce_y, z: bounce_z },
        final: { x: final_x, y: final_y, z: final_z }
      }
    }
  };
};

// Calculate actual playable boundary distance from striker position [0, 0, -9]
const calculateBoundaryDistance = (angleDegrees) => {
  // ACTUAL PLAYABLE BOUNDARY: Inner Advertising Boundary (25.5m from center)
  const PLAYABLE_BOUNDARY_RADIUS = 25.5; // field.radius * 0.85 (visible boundary ring in stadium)
  const STRIKER_POS = [0, 0, -9];
  
  const angleRad = (angleDegrees * Math.PI) / 180;
  const dirX = Math.cos(angleRad);
  const dirZ = -Math.sin(angleRad); // Inverted Z for field orientation
  
  const strikerX = STRIKER_POS[0];
  const strikerZ = STRIKER_POS[2];
  
  // Solve for intersection with playable boundary circle: (x)² + (z)² = R²
  const a = dirX * dirX + dirZ * dirZ;
  const b = 2 * (strikerX * dirX + strikerZ * dirZ);
  const c = strikerX * strikerX + strikerZ * strikerZ - PLAYABLE_BOUNDARY_RADIUS * PLAYABLE_BOUNDARY_RADIUS;
  
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return 20; // Fallback for playable area
  
  const t = (-b + Math.sqrt(discriminant)) / (2 * a);
  return Math.sqrt((t * dirX) ** 2 + (t * dirZ) ** 2);
};

// Calculate where ball should land to end up at target position after physics
const calculateLandingPositionForTarget = (targetDistance, angle) => {
  // Physics approximation factors based on cricket ball behavior
  const BOUNCE_ENERGY_RETENTION = 0.6;  // 60% energy after first bounce
  const FRICTION_FACTOR = 0.85;          // 85% speed retained after ground friction
  const AIR_RESISTANCE_FACTOR = 0.95;    // 95% speed retained due to air resistance
  
  // Combined physics factor (approximate)
  const TOTAL_PHYSICS_FACTOR = BOUNCE_ENERGY_RETENTION * FRICTION_FACTOR * AIR_RESISTANCE_FACTOR;
  // ≈ 0.6 * 0.85 * 0.95 ≈ 0.48 (ball travels ~48% further after landing)
  
  // Reverse calculation: if ball needs to travel X distance total,
  // it should land at a position where remaining momentum carries it the rest
  const momentumDistance = targetDistance * (1 - TOTAL_PHYSICS_FACTOR); // Distance from momentum/rolling
  const initialLandingDistance = targetDistance - momentumDistance;      // Where to initially land
  
  return Math.max(0.1, initialLandingDistance); // Minimum 0.1m landing distance
};

// Shot vector calculation - DETERMINISTIC DISTANCE CONTROL SYSTEM
export const calculateShotVector = (angle, targetDistanceMeters, elevation = 0.5, debugLabel = '') => {
  // COMPREHENSIVE DEBUG ANALYSIS
  console.group(`🎯 calculateShotVector - ${debugLabel}`);
  
  // CRITICAL: Check if distance is being modified internally
  console.log('INPUT PARAMETERS:', {
    angle,
    targetDistanceMeters,
    targetType: typeof targetDistanceMeters,
    elevation,
    debugLabel
  });
  
  // CRICKET FIELD ZONES FROM STRIKER POSITION [0, 0, -9]
  const STRIKER_POSITION = [0, 0, -9];
  
  // Use distance as EXACT final stopping distance (minimum 0.1m)
  const exactStopDistance = Math.max(0.1, parseFloat(targetDistanceMeters));
  
  // Check for any hidden transformations
  console.log('DISTANCE PROCESSING:', {
    rawInput: targetDistanceMeters,
    parsedFloat: parseFloat(targetDistanceMeters),
    finalDistance: exactStopDistance,
    wasModified: exactStopDistance !== parseFloat(targetDistanceMeters)
  });
  
  // Get boundary distance for reference
  const boundaryDistance = calculateBoundaryDistance(angle);
  
  // Field-corrected trigonometry: 0°=East(+X), 90°=North(-Z to keeper), 180°=West(-X), 270°=South(+Z to bowler)
  const rad = (angle * Math.PI) / 180;
  
  // Check angle conversion
  console.log('ANGLE CONVERSION:', {
    inputDegree: angle,
    radians: rad,
    cosValue: Math.cos(rad),
    sinValue: Math.sin(rad)
  });
  
  // Calculate EXACT final stopping position from striker (DETERMINISTIC)
  const stopX = Math.cos(rad) * exactStopDistance;
  const stopZ = -Math.sin(rad) * exactStopDistance;
  const finalStopX = STRIKER_POSITION[0] + stopX;
  const finalStopZ = STRIKER_POSITION[2] + stopZ;
  
  // Calculate final position step by step
  console.log('POSITION CALCULATION:', {
    strikerPosition: STRIKER_POSITION,
    deltaX: stopX,
    deltaZ: stopZ,
    finalStopX,
    finalStopZ,
    calculatedDistance: Math.sqrt(Math.pow(finalStopX - STRIKER_POSITION[0], 2) + Math.pow(finalStopZ - STRIKER_POSITION[2], 2))
  });
  
  // REVERSE PHYSICS CALCULATION: Calculate initial velocity needed to stop at exact distance
  // We need to work backwards from the final position to determine required initial velocity
  
  // Physics constants for reverse calculation
  const GRAVITY = -9.81;
  const totalFrictionLoss = 0.3; // Combined air resistance + ground friction loss factor
  const bounceEnergyLoss = 0.4;  // Energy lost in bounces
  const totalEnergyLoss = totalFrictionLoss + bounceEnergyLoss; // 70% total energy loss
  
  // Calculate required initial velocity magnitude to overcome energy losses and reach exact distance
  // Formula: initial_velocity = target_distance / (1 - total_energy_loss) / time_factor
  const timeToTarget = Math.sqrt(exactStopDistance / 5); // Dynamic time based on distance
  const energyRetentionFactor = 1 - totalEnergyLoss; // 30% energy retention
  const requiredVelocityMagnitude = exactStopDistance / (energyRetentionFactor * timeToTarget);
  
  // Direction vector (normalized)
  const dirX = Math.cos(rad);
  const dirZ = -Math.sin(rad);
  
  // Calculate velocity components that will result in EXACT stopping position
  const exactVelocityX = dirX * requiredVelocityMagnitude;
  const exactVelocityZ = dirZ * requiredVelocityMagnitude;
  const exactVelocityY = elevation + (exactStopDistance * 0.1); // Scale elevation with distance
  
  console.log('VELOCITY CALCULATION:', {
    requiredVelocityMagnitude,
    dirX,
    dirZ,
    exactVelocityX,
    exactVelocityZ,
    exactVelocityY,
    totalVelocity: Math.sqrt(exactVelocityX * exactVelocityX + exactVelocityZ * exactVelocityZ)
  });
  
  // Store deterministic target information for physics system
  if (typeof window !== 'undefined') {
    window.deterministicTarget = {
      exactDistance: exactStopDistance,
      angle: angle,
      finalStopPosition: [finalStopX, 0, finalStopZ],
      strikerPosition: STRIKER_POSITION,
      requiredVelocity: [exactVelocityX, exactVelocityY, exactVelocityZ],
      timeToTarget: timeToTarget,
      energyRetention: energyRetentionFactor
    };
    
    console.log('DETERMINISTIC TARGET SET:', window.deterministicTarget);
  }
  
  // Log with deterministic calculation information
  const label = debugLabel ? `${debugLabel} ` : '';
  const percentageOfBoundary = ((exactStopDistance / boundaryDistance) * 100).toFixed(1);
  console.log(`${label}DETERMINISTIC SHOT: ${angle}° → EXACT STOP: ${exactStopDistance.toFixed(1)}m | Stop Position: [${finalStopX.toFixed(1)}, ${finalStopZ.toFixed(1)}] (${percentageOfBoundary}% of boundary)`);
  console.log(`${label}Reverse Physics: Required Velocity: [${exactVelocityX.toFixed(2)}, ${exactVelocityY.toFixed(2)}, ${exactVelocityZ.toFixed(2)}] | Time: ${timeToTarget.toFixed(2)}s | Energy Retention: ${(energyRetentionFactor*100).toFixed(1)}%`);
  
  console.log('FINAL RETURN VALUE:', [exactVelocityX, exactVelocityY, exactVelocityZ]);
  console.groupEnd();
  
  // Return calculated velocity vector that will result in exact stopping distance
  return [exactVelocityX, exactVelocityY, exactVelocityZ];
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