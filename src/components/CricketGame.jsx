import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  createInitialGameState, 
  updateGameState, 
  calculateBallTrajectory,
  calculateBattingResponse,
  findNearestFielder,
  GAME_STATES,
  PLAYER_STATES,
  BALL_STATES
} from './CricketGameState';
import EnhancedBall from './players/EnhancedBall';
import { 
  AnimatedBatsman, 
  AnimatedBowler, 
  AnimatedWicketKeeper, 
  AnimatedFielder 
} from './players/AnimatedPlayers';
import { 
  CORE_PLAYER_POSITIONS, 
  FIELDER_POSITIONS, 
  UMPIRE_POSITIONS,
  getAllPlayersArray
} from '../constants/playerPositions';
import { defaultPositionManager } from '../utils/positionManager';

const CricketGame = ({ onGameStateChange, currentPlayerPositions, isPositionEditorActive = false }) => {
  const [gameState, setGameState] = useState(createInitialGameState());
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedControl, setSelectedControl] = useState('bowling');
  const [selectedShotDirection, setSelectedShotDirection] = useState('straight');
  const [selectedShotType, setSelectedShotType] = useState('drive'); // drive, defensive, pull, cut, loft
  const [shotPower, setShotPower] = useState(0);
  const [showBatSwing, setShowBatSwing] = useState(false);
  const [shotAngle, setShotAngle] = useState(0); // Default to straight (down arrow) - 0°
  const [keysPressed, setKeysPressed] = useState(new Set());
  const animationFrameRef = useRef();

  // Notify parent of game state changes for UI
  useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange({
        gameState,
        selectedControl,
        isPlaying,
        selectedDirection: selectedShotDirection,
        selectedShotType: selectedShotType,
        shotAngle
      });
    }
  }, [gameState, selectedControl, isPlaying, selectedShotDirection, selectedShotType, shotAngle, onGameStateChange]);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('🏏 CricketGame component mounted and ready!');
    console.log('Initial game state:', gameState.gameState);
    console.log('Press SPACEBAR to bowl, D/F/G/H/V for batting');
    return () => console.log('🏏 CricketGame component unmounted');
  }, []);

  // Game action handlers
  const handleBowl = useCallback(() => {
    console.log('🎳 Spacebar pressed! Current game state:', gameState.gameState);
    if (gameState.gameState !== GAME_STATES.WAITING_FOR_BALL) {
      console.log('❌ Cannot bowl right now. Game state must be WAITING_FOR_BALL, currently:', gameState.gameState);
      return;
    }
    
    console.log('✅ Starting bowling action!');

    const { controls } = gameState;
    const { speed, line, length } = controls.bowling;
    
    // Calculate ball trajectory with debugging
    const trajectory = calculateBallTrajectory(speed, line, length, 20);
    console.log('🎯 Ball trajectory calculated:', trajectory);
    
    // Start bowling animation
    setGameState(prevState => updateGameState(prevState, {
      type: 'START_BOWLING'
    }));

    // Delay ball release for animation
    setTimeout(() => {
      const ballData = {
        position: [0, 1, 15], // Start at bowler position (higher)
        velocity: [0, 1, -26], // Straight toward striker at [0, 0, -9]
        isMoving: true,
        trajectory: trajectory
      };
      
      console.log('🚀 Releasing ball with data:', ballData);
      
      setGameState(prevState => updateGameState(prevState, {
        type: 'BALL_BOWLED',
        ballData: ballData
      }));
    }, 500); // Reduced delay for faster action

  }, [gameState]);

  const handleBat = useCallback(() => {
    console.log('🏏 Batting attempt! Direction:', selectedShotDirection, 'Shot Type:', selectedShotType, 'Ball state:', gameState.ballState, 'Can bat:', gameState.canBat);
    
    // Check if game is in correct state
    if (gameState.gameState !== GAME_STATES.BALL_IN_PLAY) {
      console.log('❌ Cannot bat right now. Game state:', gameState.gameState);
      return;
    }
    
    // Check if ball is near striker (only bat when ball reaches striker)
    if (!gameState.canBat) {
      console.log('❌ Ball is not near striker yet. Wait for ball to reach you!');
      return;
    }
    
    // Calculate timing-based power (closer ball = more power)
    const ballPos = gameState.currentBall.position;
    const strikerPos = [0, 0, -9];
    const distance = Math.sqrt(
      Math.pow(ballPos[0] - strikerPos[0], 2) + 
      Math.pow(ballPos[2] - strikerPos[2], 2)
    );
    
    // Power based on timing - closer = more power (max 25, min 8)
    const timingPower = Math.max(8, Math.min(25, 25 - (distance * 4)));
    
    console.log('✅ Batting successful! Direction:', selectedShotDirection, 'Shot Type:', selectedShotType, 'Timing Power:', timingPower);
    console.log('🎯 Shot executed with timing-based power!');

    // Calculate shot direction based on angle (8-directional system)
    const calculateShotVector = (angle, power, elevation = 0.5) => {
      // Convert angle to radians - Cricket coordinate system where 0° = towards umpire
      const rad = (angle * Math.PI) / 180;
      const basePower = power || 15;
      
      // Calculate X and Z components for cricket field
      // 0° = towards umpire/keeper (-Z), 180° = towards bowler (+Z)
      // Keeper is at [0, 0, -11], so negative Z is towards keeper
      const x = Math.sin(rad) * basePower;
      const z = -Math.cos(rad) * basePower;  // Negative cos so 0° gives -Z (towards keeper)
      
      console.log(`Shot calculation: Angle: ${angle}°, Power: ${basePower}, X: ${x.toFixed(2)}, Z: ${z.toFixed(2)}`);
      
      return [x, elevation, z];
    };

    // Shot direction now uses live shotAngle from arrow keys - no static mapping needed

    // Map shot types to elevation and power modifiers
    const shotTypeModifiers = {
      'drive': { elevation: 0.5, powerMultiplier: 1.0 },
      'defensive': { elevation: 0.2, powerMultiplier: 0.6 },
      'pull': { elevation: 0.8, powerMultiplier: 1.2 },
      'cut': { elevation: 0.6, powerMultiplier: 1.1 },
      'loft': { elevation: 8.0, powerMultiplier: 1.5 }
    };
    
    // Get shot angle and calculate direction vector - Use current shotAngle from arrow keys
    const angle = shotAngle; // Use the live angle from arrow key state
    const shotModifier = shotTypeModifiers[selectedShotType] || shotTypeModifiers['drive'];
    const elevation = shotModifier.elevation;
    const adjustedPower = timingPower * shotModifier.powerMultiplier;
    const shotDirection = calculateShotVector(angle, adjustedPower, elevation);
    
    console.log('🏏 EXECUTING SHOT:', selectedShotDirection, 'Type:', selectedShotType, 'Live Angle:', angle, '° Direction:', shotDirection);
    
    // Calculate final velocity with timing-based power
    const scaledVelocity = shotDirection.map(v => v * (adjustedPower / 15));
    
    console.log('💥 HITTING BALL with velocity:', scaledVelocity);
    
    // Hit the ball with timing-based power!
    setGameState(prevState => updateGameState(prevState, {
      type: 'BALL_HIT',
      payload: {
        newVelocity: scaledVelocity,
        trajectory: shotDirection,
        isRunnable: timingPower > 12,
        shotType: selectedShotType,
        shotDirection: selectedShotDirection,
        power: timingPower,
        timing: distance
      }
    }));
    
    // Trigger bat swing animation
    setShowBatSwing(true);
    setTimeout(() => setShowBatSwing(false), 500);
    
    console.log('🎯 Shot dispatched successfully with animation trigger!');
    
    console.log('🎯 Ball hit! Direction:', shotDirection, 'Shot Type:', selectedShotType, 'Timing Power:', timingPower, 'Distance:', distance.toFixed(2));

  }, [gameState, selectedShotDirection, selectedShotType, shotAngle]);

  const handleFielding = useCallback((fielderId) => {
    if (gameState.ballState !== BALL_STATES.HIT) return;

    const fielders = gameState.players.fielders || [];
    const nearestFielder = findNearestFielder(gameState.currentBall.position, fielders);
    
    if (nearestFielder && nearestFielder.distance < 2) {
      // Ball fielded
      setGameState(prevState => updateGameState(prevState, {
        type: 'BALL_FIELDED',
        fielderPosition: nearestFielder.position
      }));
    }
  }, [gameState]);

  const handleThrowToKeeper = useCallback(() => {
    if (gameState.ballState !== BALL_STATES.WITH_FIELDER) return;

    const keeperPosition = gameState.players.wicketKeeper.position;
    const ballPosition = gameState.currentBall.position;
    
    // Calculate throw velocity
    const distance = Math.sqrt(
      (keeperPosition[0] - ballPosition[0]) ** 2 +
      (keeperPosition[2] - ballPosition[2]) ** 2
    );
    
    const throwSpeed = Math.min(15, distance * 2);
    const throwVelocity = [
      (keeperPosition[0] - ballPosition[0]) / distance * throwSpeed,
      3, // Arc height
      (keeperPosition[2] - ballPosition[2]) / distance * throwSpeed
    ];

    setGameState(prevState => updateGameState(prevState, {
      type: 'BALL_THROWN',
      throwVelocity
    }));
  }, [gameState]);

  // Ball event handlers
  const handleBallBounce = useCallback((bounceData) => {
    // Handle ball bounce effects, sound, particle effects
    console.log('Ball bounced:', bounceData);
    
    // Update ball position in game state if it's a position update
    if (bounceData.type === 'position_update') {
      setGameState(prevState => ({
        ...prevState,
        currentBall: {
          ...prevState.currentBall,
          position: bounceData.position,
          velocity: bounceData.velocity,
          isMoving: bounceData.isMoving
        }
      }));
    }
  }, []);

  const handleBallCatch = useCallback((catchData) => {
    if (catchData.type === 'catch') {
      // Wicket taken
      setGameState(prevState => updateGameState(prevState, {
        type: 'UPDATE_SCORE',
        scoreUpdate: { wickets: prevState.score.wickets + 1 }
      }));
    } else if (catchData.type === 'collect' && catchData.playerId === 'wicket_keeper') {
      // Ball returned to keeper
      setGameState(prevState => updateGameState(prevState, {
        type: 'BALL_WITH_KEEPER'
      }));
    } else {
      // Ball fielded
      handleFielding(catchData.playerId);
    }
  }, [handleFielding]);

  const handleBallReachTarget = useCallback((targetData) => {
    if (targetData.target === 'batsman') {
      // Ball reached batsman - trigger batting opportunity
      console.log('⚾ Ball reached striker - NOW YOU CAN BAT! Distance:', targetData.distance);
      setGameState(prevState => ({
        ...prevState,
        ballState: BALL_STATES.BOWLING, // Keep as bowling until hit
        canBat: true // Enable batting when ball is close
      }));
      
      // Add visual/audio cue that batting is now possible
      console.log('🎯 BATTING WINDOW OPEN - Press D/F/G/H/V to hit!');
    } else if (targetData.target === 'boundary') {
      // Boundary scored
      setGameState(prevState => updateGameState(prevState, {
        type: 'UPDATE_SCORE',
        scoreUpdate: { runs: prevState.score.runs + targetData.runs }
      }));
      
      // Return ball to keeper after boundary
      setTimeout(() => {
        setGameState(prevState => updateGameState(prevState, {
          type: 'BALL_WITH_KEEPER'
        }));
      }, 3000);
    }
  }, []);

  // Advanced 8-directional shot selection - Only active when position editor is NOT open
  useEffect(() => {
    // Skip shot direction handling if position editor is active
    if (isPositionEditorActive) {
      console.log('🔧 Position editor active - skipping shot direction updates');
      return;
    }

    const up = keysPressed.has('arrowup');
    const down = keysPressed.has('arrowdown');
    const left = keysPressed.has('arrowleft');
    const right = keysPressed.has('arrowright');
    
    let newDirection = 'straight';
    let newAngle = 0; // Straight is now 0°
    
    if (up && right) {
      newDirection = 'glance';
      newAngle = 135;  // Up-Right = Glance (was 45°, now towards bowler side)
    } else if (down && right) {
      newDirection = 'cover';
      newAngle = 45;  // Down-Right = Covers (was 135°, now towards keeper side)
    } else if (down && left) {
      newDirection = 'onside';
      newAngle = 315;  // Down-Left = On side (was 225°, now towards keeper side)
    } else if (up && left) {
      newDirection = 'pull';
      newAngle = 225;  // Up-Left = Pull (was 315°, now towards bowler side) 
    } else if (up) {
      newDirection = 'defensive';
      newAngle = 180;  // Up = Defence (towards bowler)
    } else if (right) {
      newDirection = 'point';
      newAngle = 90;  // Right = Point (right side)
    } else if (down) {
      newDirection = 'straight';
      newAngle = 0;  // Down = Straight (towards keeper) - 0°
    } else if (left) {
      newDirection = 'midwicket';
      newAngle = 270;  // Left = Midwicket (left side)
    }
    
    setSelectedShotDirection(newDirection);
    setShotAngle(newAngle);
    
    console.log('🎯 Shot Direction Updated:', {
      keysPressed: Array.from(keysPressed),
      newDirection: newDirection,
      newAngle: newAngle
    });
  }, [keysPressed, isPositionEditorActive]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      
      // Add to pressed keys for directional detection - but skip if position editor is active
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        if (isPositionEditorActive) {
          // Don't prevent default or handle arrow keys when position editor is active
          console.log('🔧 Position editor active - ignoring arrow key for cricket game');
          return;
        }
        event.preventDefault();
        setKeysPressed(prev => new Set(prev).add(key));
        return;
      }
      
      switch (key) {
         // Shot type selection (separate from direction)
         case 'd':
           setSelectedShotType('defensive');
           console.log('🛡️ Defensive shot selected');
          break;
         case 'f':
           setSelectedShotType('drive');
           console.log('🏏 Drive shot selected');
          break;
         case 'g':
           setSelectedShotType('pull');
           console.log('💪 Pull shot selected');
          break;
         case 'h':
           setSelectedShotType('cut');
           console.log('✂️ Cut shot selected');
          break;
         case 'v':
           setSelectedShotType('loft');
           console.log('🚀 Loft shot selected');
          break;
          
        // Batting execution (Space when ball is near)
        case ' ':
          event.preventDefault();
          event.stopPropagation();
          if (gameState.gameState === GAME_STATES.BALL_IN_PLAY && gameState.canBat) {
            console.log('🏏 Executing shot!');
            handleBat();
          } else if (gameState.gameState === GAME_STATES.WAITING_FOR_BALL) {
            console.log('🎳 Bowling!');
            handleBowl();
          } else {
            console.log('⏳ Cannot act now. Game state:', gameState.gameState, 'Can bat:', gameState.canBat);
          }
          break;
          
        // Fielding controls
        case 't': // Throw to keeper
          handleThrowToKeeper();
          break;
          
        // Control switching
        case '1':
          setSelectedControl('bowling');
          break;
        case '2':
          setSelectedControl('batting');
          break;
        case '3':
          setSelectedControl('fielding');
          break;
          
        // Game controls
        case 'p':
          setIsPlaying(!isPlaying);
          break;
          
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        if (isPositionEditorActive) {
          // Don't handle arrow key releases when position editor is active
          console.log('🔧 Position editor active - ignoring arrow key release for cricket game');
          return;
        }
        event.preventDefault();
        setKeysPressed(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, isPlaying, handleBowl, handleBat, handleThrowToKeeper, isPositionEditorActive]);

  // Control updates
  const updateBowlingControls = useCallback((updates) => {
    setGameState(prevState => updateGameState(prevState, {
      type: 'UPDATE_CONTROLS',
      controlType: 'bowling',
      updates
    }));
  }, []);

  const updateBattingControls = useCallback((updates) => {
    setGameState(prevState => updateGameState(prevState, {
      type: 'UPDATE_CONTROLS',
      controlType: 'batting',
      updates
    }));
  }, []);

  // Get dynamic positions from position manager (with fallback for safety)
  const positions = currentPlayerPositions || {};
  const umpirePositions = {
    bowlersEnd: positions.umpire_bowlers_end?.position || UMPIRE_POSITIONS.BOWLERS_END.position,
    point: positions.umpire_square_leg?.position || UMPIRE_POSITIONS.SQUARE_LEG_UMPIRE.position
  };

  // Create fielder positions from dynamic positions
  const fielderPositions = [
    { position: positions.mid_off?.position || FIELDER_POSITIONS.MID_OFF.position, role: 'mid-off' },
    { position: positions.mid_on?.position || FIELDER_POSITIONS.MID_ON.position, role: 'mid-on' },
    { position: positions.cover?.position || FIELDER_POSITIONS.COVER.position, role: 'cover' },
    { position: positions.mid_wicket?.position || FIELDER_POSITIONS.MID_WICKET.position, role: 'mid-wicket' },
    { position: positions.third_man?.position || FIELDER_POSITIONS.THIRD_MAN.position, role: 'third-man' },
    { position: positions.fine_leg?.position || FIELDER_POSITIONS.FINE_LEG.position, role: 'fine-leg' },
    { position: positions.point?.position || FIELDER_POSITIONS.POINT.position, role: 'point' },
    { position: positions.square_leg?.position || FIELDER_POSITIONS.SQUARE_LEG.position, role: 'square-leg' },
    { position: positions.long_off?.position || FIELDER_POSITIONS.LONG_OFF.position, role: 'long-off' },
    { position: positions.long_on?.position || FIELDER_POSITIONS.LONG_ON.position, role: 'long-on' }
  ];

  return (
    <group>
      {/* Players */}
      
      {/* Striker (on strike) */}
      <AnimatedBatsman
        position={positions.striker?.position || gameState.players.striker.position}
        isStrike={true}
        animation={gameState.players.striker.animation}
        gameState={gameState}
         selectedShotDirection={selectedShotDirection}
         selectedShotType={selectedShotType}
         showBatSwing={showBatSwing}
      />
      
      {/* Non-striker */}
      <AnimatedBatsman
        position={positions.non_striker?.position || gameState.players.nonStriker.position}
        isStrike={false}
        animation={gameState.players.nonStriker.animation}
        gameState={gameState}
      />
      
      {/* Bowler */}
      <AnimatedBowler
        position={positions.bowler?.position || gameState.players.bowler.position}
        animation={gameState.players.bowler.animation}
        bowlingType={gameState.controls.bowling.type || 'fast'}
        gameState={gameState}
      />
      
      {/* Wicket Keeper */}
      <AnimatedWicketKeeper
        position={positions.wicket_keeper?.position || gameState.players.wicketKeeper.position}
        animation={gameState.players.wicketKeeper.animation}
        gameState={gameState}
      />
      
      {/* Umpires */}
      <AnimatedFielder
        position={umpirePositions.bowlersEnd}
        teamColor="#000000"
        animation="idle"
      />
      <AnimatedFielder
        position={umpirePositions.point}
        teamColor="#000000"
        animation="idle"
      />
      
      {/* Fielders */}
      {fielderPositions.map((fielder, index) => (
        <AnimatedFielder
          key={`fielder-${index}`}
          position={fielder.position}
          teamColor="#0000FF"
          animation="idle"
          gameState={gameState}
        />
      ))}
      
      {/* Enhanced Ball */}
      <EnhancedBall
        gameState={gameState}
        onBounce={handleBallBounce}
        onCatch={handleBallCatch}
        onReachTarget={handleBallReachTarget}
        showTrajectory={true}
      />
      
             {/* Field Boundary Regions */}
       <FieldRegions selectedDirection={selectedShotDirection} selectedShotType={selectedShotType} shotAngle={shotAngle} />
      
      {/* Wickets */}
      <Wickets />
      

    </group>
  );
};

// Wickets component
const Wickets = () => (
  <>
    {/* Striker's end wickets (swapped position) */}
    <group position={[0, 0, -10]}>
      {/* Stumps */}
      <mesh position={[-0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      {/* Bails */}
      <mesh position={[-0.05, 0.82, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.05, 0.82, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
    </group>
    
    {/* Bowler's end wickets (swapped position) */}
    <group position={[0, 0, 10]}>
      <mesh position={[-0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.05, 0.82, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.05, 0.82, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
    </group>
  </>
);



// Advanced Field Regions Component - Shows 8 directional cricket shots
const FieldRegions = ({ selectedDirection, selectedShotType, shotAngle }) => {
  const shotZones = [
    { name: 'straight', angle: 0, position: [0, 0.1, -25], label: 'STRAIGHT' },      // Towards keeper - 0°
    { name: 'defensive', angle: 180, position: [0, 0.1, 25], label: 'DEFENCE' },     // Towards bowler
    { name: 'cover', angle: 45, position: [17, 0.1, -17], label: 'COVERS' },        // Down-Right (keeper side)
    { name: 'point', angle: 90, position: [25, 0.1, 0], label: 'POINT' },           // Right side
    { name: 'glance', angle: 135, position: [17, 0.1, 17], label: 'GLANCE' },       // Up-Right (bowler side)
    { name: 'onside', angle: 315, position: [-17, 0.1, -17], label: 'ON SIDE' },    // Down-Left (keeper side)
    { name: 'midwicket', angle: 270, position: [-25, 0.1, 0], label: 'MIDWICKET' }, // Left side
    { name: 'pull', angle: 225, position: [-17, 0.1, 17], label: 'PULL' }           // Up-Left (bowler side)
  ];

  return (
    <group>
      {/* Shot direction indicator - rotating arrow */}
      <group position={[0, 0.2, 0]} rotation={[0, (shotAngle * Math.PI) / 180, 0]}>
        <mesh position={[0, 0, 8]} rotation={[-Math.PI/2, 0, 0]}>
          <coneGeometry args={[1.5, 4, 6]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0, 4]} rotation={[-Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 6, 8]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.7} />
        </mesh>
        {/* Arrow shaft pointing in direction */}
        <mesh position={[0, 0, 1]}>
          <boxGeometry args={[0.5, 0.2, 6]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Shot zones */}
      {shotZones.map((zone, index) => {
        const isSelected = selectedDirection === zone.name;
        const color = isSelected ? '#00FF00' : '#666666';
        
        return (
          <group key={zone.name}>
            {/* Zone marker */}
            <mesh position={zone.position}>
              <cylinderGeometry args={[isSelected ? 3 : 2, isSelected ? 3 : 2, 0.3, 8]} />
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={isSelected ? 0.9 : 0.4}
              />
            </mesh>
            
            {/* Zone label pole */}
            <mesh position={[zone.position[0], 3, zone.position[2]]}>
              <boxGeometry args={[0.2, 6, 0.2]} />
              <meshBasicMaterial color={color} />
            </mesh>
            
            {/* Label background */}
            <mesh position={[zone.position[0], 6, zone.position[2]]}>
              <boxGeometry args={[6, 1, 0.1]} />
              <meshBasicMaterial color={isSelected ? '#00FF00' : '#333333'} />
            </mesh>
          </group>
        );
      })}
      
      {/* Power indicator rings */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[10, 12, 32]} />
        <meshBasicMaterial color="#FF0000" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[15, 17, 32]} />
        <meshBasicMaterial color="#FFFF00" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[20, 22, 32]} />
        <meshBasicMaterial color="#00FF00" transparent opacity={0.3} />
      </mesh>
      
      {/* Boundary circle */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[25, 27, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export default CricketGame;