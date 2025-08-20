import React, { useState, useEffect, useCallback } from 'react';
import { 
  createInitialGameState, 
  updateGameState, 
  calculateBallTrajectory,
  calculateShotVector,
  findNearestFielder,
  GAME_STATES,
  PLAYER_STATES,
  BALL_STATES
} from './CricketGameState';
import EnhancedBall from './players/EnhancedBall';
import PitchMarkers from './PitchMarkers';
import { useCameraControls } from '../hooks/useCameraControls';
import { 
  AnimatedBatsman, 
  AnimatedBowler, 
  AnimatedWicketKeeper, 
  AnimatedFielder 
} from './players/AnimatedPlayers';
import { 
  FIELDER_POSITIONS, 
  UMPIRE_POSITIONS
} from '../constants/playerPositions';
import ZoneMarkers from './ZoneMarkers';

const CricketGame = ({ onGameStateChange, currentPlayerPositions, isPositionEditorActive = false, isEmbedded = false, matchId = null, dummyGameData = null, isDummyDataActive = false, onBallPositionUpdate }) => {
  const [gameState, setGameState] = useState(createInitialGameState());
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedShotDirection, setSelectedShotDirection] = useState('straight');
  const [selectedShotType, setSelectedShotType] = useState('drive'); // drive, defensive, pull, cut, loft
  const [showBatSwing, setShowBatSwing] = useState(false);
  const [shotAngle, setShotAngle] = useState(0); // Default to straight (down arrow) - 0°
  const [keysPressed, setKeysPressed] = useState(new Set());

  // Pitch guide visibility states
  const [showPitchMarkers, setShowPitchMarkers] = useState(false); // Disabled for cleaner stadium view
  const [showZoneMarkers, setShowZoneMarkers] = useState(false);
  const [showCoordinateDisplay, setShowCoordinateDisplay] = useState(false); // Disabled for cleaner view
  const [showPitchGrid, setShowPitchGrid] = useState(false); // Disabled for cleaner view
  const [useCompactUI, setUseCompactUI] = useState(true); // Toggle between full and compact UI
  
  // Camera controls integration
  const { currentView, switchToView } = useCameraControls();



  // Handler for updating bowling configuration from pitch analysis
  const handleBowlingConfigUpdate = useCallback((newConfig) => {
    setGameState(prevState => ({
      ...prevState,
      controls: {
        ...prevState.controls,
        bowling: {
          ...prevState.controls.bowling,
          ...newConfig
        }
      }
    }));
  }, []);

  // Handler for updating ball shot configuration
  const handleBallShotConfigUpdate = useCallback((newConfig) => {
    setGameState(prevState => ({
      ...prevState,
      controls: {
        ...prevState.controls,
        ballShot: {
          ...prevState.controls.ballShot,
          ...newConfig
        }
      }
    }));
  }, [gameState.controls.ballShot]);

  // Function to apply dummy data to game state
  const applyDummyData = useCallback((dummyData) => {
    if (!dummyData) return;

    console.log('Applying dummy data to cricket game:', dummyData);
    
    // Create new game state based on dummy data
    const newGameState = {
      ...createInitialGameState(),
      gameState: dummyData.gameState.gameState,
      ballState: dummyData.gameState.ballState,
      canBat: dummyData.gameState.canBat,
      score: dummyData.gameState.score,
      currentBall: dummyData.gameState.currentBall,
      players: {
        ...dummyData.players,
        fielders: dummyData.players.fielders || []
      },
      controls: dummyData.controls,
      lastAction: dummyData.gameState.lastAction,
      animations: dummyData.animations || { active: [], queue: [] }
    };

    setGameState(newGameState);
    
    // Update other UI states based on dummy data
    if (dummyData.controls?.ballShot?.degree !== undefined) {
      setShotAngle(dummyData.controls.ballShot.degree);
    }
    if (dummyData.controls?.batting?.shot) {
      setSelectedShotType(dummyData.controls.batting.shot);
    }
  }, []);

  // Effect to handle dummy data loading
  useEffect(() => {
    if (isDummyDataActive && dummyGameData) {
      applyDummyData(dummyGameData);
    } else if (!isDummyDataActive) {
      // Reset to initial state when dummy data is cleared
      setGameState(createInitialGameState());
      setShotAngle(0);
      setSelectedShotType('drive');
      setSelectedShotDirection('straight');
      setIsPlaying(false);
    }
  }, [isDummyDataActive, dummyGameData, applyDummyData]);

  useEffect(() => {}, []);

  // Reusable helper function to reset ball to bowler position
  const resetBallToBowler = useCallback((reason = 'manual_reset') => {
    console.log(`🔄 Resetting ball to bowler: ${reason}`);
    setGameState(prevState => ({
      ...prevState,
      gameState: GAME_STATES.WAITING_FOR_BALL,
      ballState: BALL_STATES.WITH_BOWLER,
      canBat: false,
      bowlingSequenceActive: false, // 🚨 CRITICAL: Reset bowling sequence
      bowlingAnimation: null, // Clear bowling animation
      pendingBallData: null, // Clear any pending data
      currentBall: {
        position: [0, 0.5, 15], // Bowler position
        velocity: [0, 0, 0],
        isMoving: false,
        trajectory: []
      },
      players: {
        ...prevState.players,
        striker: {
          ...prevState.players.striker,
          state: PLAYER_STATES.READY
        },
        nonStriker: {
          ...prevState.players.nonStriker,
          state: PLAYER_STATES.IDLE
        },
        bowler: {
          ...prevState.players.bowler,
          state: PLAYER_STATES.READY,
          animation: null // Reset bowler animation
        }
      }
    }));
    
    // Clear any pending ball data from global scope
    window.pendingBallData = null;
    console.log(`✅ Ball reset complete - ready for next delivery`);
  }, []);

  // 🏏 REALISTIC BOWLING HANDLER with Run-up and Ball Release Coordination
  const handleBowl = useCallback(() => {
    if (gameState.gameState !== GAME_STATES.WAITING_FOR_BALL) {
      return;
    }

    const { controls } = gameState;
    const bowlingControls = controls.bowling;
    
    // Calculate enhanced ball trajectory using pitch analysis
    const trajectory = calculateBallTrajectory(bowlingControls);
    
    console.log(`🏏 Starting realistic bowling sequence - ${bowlingControls.type || 'fast'} bowling`);
    
    // 🏃‍♂️ START RUN-UP ANIMATION - Trigger realistic bowling sequence
    setGameState(prevState => updateGameState(prevState, {
      type: 'START_BOWLING',
      bowlingAnimation: 'runUp', // Start with run-up animation
      ballData: trajectory // Store trajectory for later use
    }));

    // Store trajectory data for ball release
    window.pendingBallData = {
      position: trajectory.initial.position,
      velocity: trajectory.initial.velocity,
      isMoving: true,
      bounceHeight: bowlingControls.bounceHeight || 0.5,
      trajectory: {
        initial: trajectory.initial,
        bounce: trajectory.bounce,
        target: trajectory.target,
        metadata: trajectory.metadata
      },
      pitchAnalysis: {
        ball_axis: { x: bowlingControls.ball_axis_x, y: bowlingControls.ball_axis_y },
        length_axis: { x: bowlingControls.length_axis_x, z: bowlingControls.length_axis_z },
        line_axis: { x: bowlingControls.line_axis_x, z: bowlingControls.line_axis_z },
        velocity: bowlingControls.velocity
      }
    };

  }, [gameState]);

  // 🎯 BALL RELEASE HANDLER - Called by bowler animation at the right moment
  const handleBallRelease = useCallback(() => {
    console.log('🎯🎯🎯 BALL RELEASE HANDLER CALLED! 🎯🎯🎯');
    console.log('Pending ball data:', window.pendingBallData);
    
    if (window.pendingBallData) {
      console.log('✅ Releasing ball with pending data');
      
      // 🏏 CRITICAL: Ball releases from ACTUAL release position from bowling data
      // Use the exact release_z coordinate from the bowling configuration
      const releaseZ = window.pendingBallData.pitchAnalysis?.line_axis?.z || 
                       gameState.controls?.bowling?.release_z || 11.5;
      
      // 🏏 CRICKET BOWLING SIDES: Adjust X position based on side
      const bowlingSide = gameState.controls?.bowling?.side || "L";
      let bowlerX = 0; // Default center position
      
      if (bowlingSide === "L") {
        bowlerX = -1.0; // Over the wicket (left side from batsman's perspective)
        console.log('🏏 Bowling OVER THE WICKET (L) - Bowler positioned left');
      } else if (bowlingSide === "R") {
        bowlerX = 1.0; // Around the wicket (right side from batsman's perspective)
        console.log('🏏 Bowling AROUND THE WICKET (R) - Bowler positioned right');
      }
      
      const actualBowlerPosition = [bowlerX, 0.5, releaseZ]; // Bowler's position at release point
      
      const releasePosition = [
        actualBowlerPosition[0],                      // X: Bowler's X position
        actualBowlerPosition[1] + 1.5,                // Y: Bowler's hand height (0.5 + 1.5 = 2.0)
        actualBowlerPosition[2]                       // Z: Bowler's actual release position
      ];
      
      const updatedBallData = {
        ...window.pendingBallData,
        position: releasePosition
      };
      
      console.log(`🏏 Ball releases from ACTUAL release position: [${releasePosition[0]}, ${releasePosition[1]}, ${releasePosition[2]}]`);
      console.log(`🏃‍♂️ Bowler runs to release position: from [0, 0.5, 15] to [0, 0.5, ${releaseZ}]`);
      
      setGameState(prevState => updateGameState(prevState, {
        type: 'BALL_BOWLED',
        ballData: updatedBallData
      }));
      
      // Clear pending data
      window.pendingBallData = null;
      console.log('✅ Ball successfully released from ACTUAL bowler position and pending data cleared');
    } else {
      console.error('❌ No pending ball data found!');
    }
  }, []);

  // 🚨 DEBUG: Log when handleBallRelease is created
  React.useEffect(() => {
    console.log('🎯 handleBallRelease callback created/updated');
  }, [handleBallRelease]);

  const handleBat = useCallback(() => {
    // Check if game is in correct state
    if (gameState.gameState !== GAME_STATES.BALL_IN_PLAY) {
      return;
    }
    
    // Check if ball is near striker (only bat when ball reaches striker)
    if (!gameState.canBat) {
      return;
    }
    
    // Calculate timing-based power (closer ball = more power)
    const ballPos = gameState.currentBall.position;
    const strikerPos = [0, 0, -9];
    const distance = Math.sqrt(
      Math.pow(ballPos[0] - strikerPos[0], 2) + 
      Math.pow(ballPos[2] - strikerPos[2], 2)
    );
    
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
    
    // Use DETERMINISTIC distance from ball shot configuration
    const ballShotConfig = gameState.controls.ballShot;
    const targetDistance = ballShotConfig.distance || 15; // Get exact distance from config
    const shotDirection = calculateShotVector(angle, targetDistance, elevation, '🎯 MANUAL');
    
    // Calculate final velocity with deterministic target distance
    const scaledVelocity = shotDirection; // Use exact calculated velocity from deterministic system
    
    // Hit the ball with exact distance control!
    setGameState(prevState => updateGameState(prevState, {
      type: 'BALL_HIT',
      payload: {
        newVelocity: scaledVelocity,
        trajectory: shotDirection,
        isRunnable: targetDistance > 5, // Runnable if distance > 5m
        shotType: selectedShotType,
        shotDirection: selectedShotDirection,
        power: targetDistance, // Use target distance as power indicator
        timing: targetDistance // Use target distance for consistency
      }
    }));
    
    // Trigger bat swing animation
    setShowBatSwing(true);
    setTimeout(() => setShowBatSwing(false), 500);

  }, [gameState, selectedShotDirection, selectedShotType, shotAngle]);

  const handleFielding = useCallback(() => {
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
    } else if (catchData.type === 'collect') {
      if (catchData.playerId === 'wicket_keeper') {
        // Ball collected by keeper - first set to keeper, then return to bowler
        setGameState(prevState => {
          const updatedState = updateGameState(prevState, {
            type: 'BALL_WITH_KEEPER'
          });
          
          // ✅ Automatically return ball to bowler after keeper collection
          const returnDelay = prevState.controls?.ballShot?.resetDelay || 2.0; // Use current state delay
          setTimeout(() => {
            resetBallToBowler('keeper_to_bowler');
          }, returnDelay * 1000);
          
          return updatedState;
        });
        
      } else if (catchData.playerId === 'bowler' || catchData.reason === 'reset_to_bowler') {
        // Ball reset to bowler (for boundary, max distance, etc.)
        resetBallToBowler(catchData.reason || 'reset_to_bowler');
      } else {
        // Ball fielded by other player
        handleFielding();
      }
    } else {
      // Ball fielded
      handleFielding();
    }
  }, [handleFielding, resetBallToBowler]);



  const handleBallReachTarget = useCallback((targetData) => {
    if (targetData.target === 'batsman') {
      // Calculate distance between ball and striker position (ignore Y axis for now)
      const ballPos = targetData.position;
      const strikerPos = [0, 0, -9]; // Striker position
      const ballZ = ballPos[2];
      const strikerZ = strikerPos[2];
      const distanceZ = Math.abs(ballZ - strikerZ); // Distance along Z-axis only
      
      // Check if autoPlay is enabled and ball is close enough (within 2 meters on Z-axis)
      const ballShotConfig = gameState.controls.ballShot;
      const shouldAutoShot = ballShotConfig.autoPlay && distanceZ <= 2.0;
      
      setGameState(prevState => ({
        ...prevState,
        ballState: BALL_STATES.BOWLING, // Keep as bowling until hit
        canBat: true // Enable batting when ball is close
      }));
      
      if (shouldAutoShot) {
        // Trigger automatic shot using ball shot configuration immediately when ball is in position
        setTimeout(() => {
          // Ensure we have valid values from configuration
          const ballShotConfig = gameState.controls.ballShot;
          const targetDistance = parseFloat(ballShotConfig.distance) || 15; // Default to 15m if not specified
          
          // Use ball shot configuration for DETERMINISTIC shot
          const angle = ballShotConfig.degree || 0;
          const isLofted = ballShotConfig.lofted || false;
          const elevation = isLofted ? 8.0 : 0.5;
          
          // USE THE SAME calculateShotVector FUNCTION AS MANUAL SHOTS
          // This ensures window.deterministicTarget is properly set
          const scaledVelocity = calculateShotVector(angle, targetDistance, elevation, '🤖 AUTO');
          const shotDirection = scaledVelocity;
          
          // Execute auto shot from striker's position
          setGameState(prevState => {
            // Position ball at striker and apply the shot
            const updatedState = {
              ...prevState,
              currentBall: {
                ...prevState.currentBall,
                position: [0, 0.5, -9], // Striker's position
                velocity: [0, 0, 0] // Reset velocity before shot
              }
            };
            
            // Apply the ball hit action with the calculated trajectory
            return updateGameState(updatedState, {
              type: 'BALL_HIT',
              payload: {
                newVelocity: scaledVelocity,
                trajectory: shotDirection,
                isRunnable: targetDistance > 5,
                shotType: isLofted ? 'loft' : ballShotConfig.type || 'drive',
                shotDirection: `${angle}°`,
                startPosition: [0, 0.5, -9], // Ensure shot starts from striker
                targetDistance // For verification
              }
            });
          });
        }, 100); // Small delay to ensure state is updated
      }
    } else if (targetData.target === 'final_coordinate') {
      // Ball reached final coordinate in direct coordinate mode
      // ✅ Check if auto-reset is enabled (default: false to let ball stay at target)
      const ballShotConfig = gameState.controls?.ballShot;
      const autoResetAfterTarget = ballShotConfig?.autoResetAfterTarget ?? false;
      
      if (autoResetAfterTarget) {
        // Only reset if explicitly enabled
        setTimeout(() => {
          setGameState(prevState => updateGameState(prevState, {
            type: 'BALL_WITH_KEEPER'
          }));
        }, ballShotConfig?.resetDelay || 5000); // Use user-defined delay (default 5s)
      }
      // ✅ If auto-reset is disabled, ball stays at final coordinate
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
  }, [gameState.controls.ballShot]); // Add ballShot config to dependencies

  // Direct compass shot selection - NO intermediate logic
  useEffect(() => {
    // Skip shot direction handling if position editor is active
    if (isPositionEditorActive) {
      return;
    }

    const up = keysPressed.has('arrowup');
    const down = keysPressed.has('arrowdown');
    const left = keysPressed.has('arrowleft');
    const right = keysPressed.has('arrowright');
    
    let newDirection = 'east';
    let newAngle = 0; // East = 0°
    
    if (up && right) {
      newDirection = 'northeast';
      newAngle = 45;   // Up-Right = NE (45°)
    } else if (down && right) {
      newDirection = 'southeast';
      newAngle = 315;  // Down-Right = SE (315°)
    } else if (down && left) {
      newDirection = 'southwest';
      newAngle = 225;  // Down-Left = SW (225°)
    } else if (up && left) {
      newDirection = 'northwest';
      newAngle = 135;  // Up-Left = NW (135°)
    } else if (up) {
      newDirection = 'north';
      newAngle = 90;   // Up = North (90°) - Keeper
    } else if (right) {
      newDirection = 'east';
      newAngle = 0;    // Right = East (0°)
    } else if (down) {
      newDirection = 'south';
      newAngle = 270;  // Down = South (270°) - Bowler
    } else if (left) {
      newDirection = 'west';
      newAngle = 180;  // Left = West (180°)
    }
    
    setSelectedShotDirection(newDirection);
    setShotAngle(newAngle);
  }, [keysPressed, isPositionEditorActive]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      
      // Skip if key is used for camera controls (1-6)
      if (['1', '2', '3', '4', '5', '6'].includes(key)) {
        return;
      }
      
      // Add to pressed keys for directional detection - but skip if position editor is active
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        if (isPositionEditorActive) {
          // Don't prevent default or handle arrow keys when position editor is active
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
          break;
         case 'f':
           setSelectedShotType('drive');
          break;
         case 'g':
           setSelectedShotType('pull');
          break;
         case 'h':
           setSelectedShotType('cut');
          break;
         case 'v':
           setSelectedShotType('loft');
          break;
          
        // Batting execution (Space when ball is near)
        case ' ':
          event.preventDefault();
          event.stopPropagation();
          if (gameState.gameState === GAME_STATES.BALL_IN_PLAY && gameState.canBat) {
            handleBat();
          } else if (gameState.gameState === GAME_STATES.WAITING_FOR_BALL) {
            handleBowl();
          }
          break;
          
        // Fielding controls
        case 't': // Throw to keeper
          handleThrowToKeeper();
          break;
          
        // Manual reset ball to bowler
        case 'r':
          event.preventDefault();
          resetBallToBowler('manual_reset');
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

  // Helper function to play a complete ball delivery and shot
  const playShot = useCallback(({
    // Bowling inputs
    releasePosition = [0, 2, 15],
    bouncePosition = [0, 0, 0],
    finalPosition = [0, 0.5, -9],
    // Shot inputs
    shotDegree = 0,
    shotDistance = 0,
    isLofted = false
  }) => {
    // First reset the ball to ensure clean state
    resetBallToBowler();

    // Wait for reset, then update controls and bowl
    setTimeout(() => {
      // Create bowling controls object with coordinates
      const bowlingControls = {
        useDirectCoordinates: true,
        release_x: releasePosition[0],
        release_y: releasePosition[1],
        release_z: releasePosition[2],
        bounce_x: bouncePosition[0],
        bounce_y: bouncePosition[1],
        bounce_z: bouncePosition[2],
        final_x: finalPosition[0],
        final_y: finalPosition[1],
        final_z: finalPosition[2],
        velocity: 100, // Default velocity in km/h
        bounceHeight: 0.5
      };

      // Calculate trajectory directly with the new coordinates
      const trajectory = calculateBallTrajectory(bowlingControls);

      // Update the game state with new controls
      setGameState(prevState => {
        const updatedState = {
          ...prevState,
          controls: {
            ...prevState.controls,
            bowling: {
              ...prevState.controls.bowling,
              ...bowlingControls
            },
            ballShot: {
              ...prevState.controls.ballShot,
              degree: shotDegree,
              distance: shotDistance,
              lofted: isLofted,
              autoPlay: true,
              useDirectCoordinates: true
            }
          }
        };

        // Start bowling animation
        const bowlingState = updateGameState(updatedState, {
          type: 'START_BOWLING'
        });

        // 🚨 REMOVED DELAYED RELEASE - Ball now releases through animation system
        // Ball will be released immediately when bowler reaches release point via handleBallRelease callback

        return bowlingState;
      });
    }, 100);
  }, [resetBallToBowler, handleBowl]);

  // Control updates
  const updateBowlingControls = useCallback((type, value) => {
    console.log(`Updating bowling control: ${type} = ${value}`);
    setGameState(prevState => updateGameState(prevState, {
      type: 'UPDATE_CONTROLS',
      controlType: 'bowling',
      updates: { [type]: value }
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

  // Pass UI state to parent for external rendering
  React.useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange({
        gameState,
        isPlaying,
        selectedDirection: selectedShotDirection,
        selectedShotType: selectedShotType,
        shotAngle,
        onBowlingControlChange: updateBowlingControls,
        // UI Control States for external panel
        useCompactUI,
        setUseCompactUI,
        handleBowlingConfigUpdate,
        handleBallShotConfigUpdate,
        resetBallToBowler, // Expose reset function for external use
        playShot, // Expose playShot function for external use
        showPitchMarkers,
        setShowPitchMarkers,
        showCoordinateDisplay,
        setShowCoordinateDisplay,
        showPitchGrid,
        setShowPitchGrid,
        showZoneMarkers,
        setShowZoneMarkers,
        currentView,
        switchToView,
        // Add playShot function to gameState for UI access
        playShot
      });
    }
  }, [
    gameState, isPlaying, selectedShotDirection, selectedShotType, shotAngle,
    useCompactUI, showPitchMarkers, showCoordinateDisplay, showPitchGrid, showZoneMarkers, currentView,
    onGameStateChange, updateBowlingControls, handleBowlingConfigUpdate, handleBallShotConfigUpdate,
    resetBallToBowler, switchToView, playShot
  ]);

  return (
    <group>
      {/* Dummy Data Visual Indicator - Removed for clean scene */}

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
      
      {/* Bowler with Realistic Animations */}
      <AnimatedBowler
        position={(() => {
          // 🏏 CRICKET BOWLING SIDES: Adjust bowler position based on side
          const baseBowlerPosition = positions.bowler?.position || gameState.players.bowler.position;
          const bowlingSide = gameState.controls?.bowling?.side || "L";
          
          let adjustedPosition = [...baseBowlerPosition];
          if (bowlingSide === "L") {
            adjustedPosition[0] = -1.0; // Over the wicket (left side)
          } else if (bowlingSide === "R") {
            adjustedPosition[0] = 1.0; // Around the wicket (right side)
          }
          
          return adjustedPosition;
        })()}
        animation={gameState.bowlingSequenceActive ? 'runUp' : 'idle'}
        bowlingType={gameState.controls.bowling.type || 'fast'}
        gameState={gameState}
        onBallRelease={handleBallRelease}
      />
      
      {/* Debug Info - Removed for clean visual */}
      
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
        showTrajectory={false}
        onBallPositionUpdate={onBallPositionUpdate}
      />
      
             {/* Field Boundary Regions - Hidden for clean view */}
       {/* <FieldRegions selectedDirection={selectedShotDirection} selectedShotType={selectedShotType} shotAngle={shotAngle} /> */}
      
      {/* Wickets */}
      {/* <Wickets /> */}
      


      {/* Pitch Markers for Release, Bounce, and Final Positions */}
      {showPitchMarkers && (
        <PitchMarkers 
          bowlingControls={gameState.controls.bowling}
          showCoordinates={false}
          showGrid={showPitchGrid}
        />
      )}

      {/* Zone Markers for Shot Distance Visualization */}
      {showZoneMarkers && (
        <ZoneMarkers 
          visible={showZoneMarkers}
          strikerPosition={[0, 0, -9]}
          currentDistance={gameState.controls.ballShot.distance}
          currentAngle={gameState.controls.ballShot.degree}
        />
      )}

    </group>
  );
};





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
      {/* <group position={[0, 0.2, 0]} rotation={[0, (shotAngle * Math.PI) / 180, 0]}>
        <mesh position={[0, 0, 8]} rotation={[-Math.PI/2, 0, 0]}>
          <coneGeometry args={[1.5, 4, 6]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0, 4]} rotation={[-Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 6, 8]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0, 1]}>
          <boxGeometry args={[0.5, 0.2, 6]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      </group> */}

      {/* Shot zones */}
      {shotZones.map((zone, index) => {
        const isSelected = selectedDirection === zone.name;
        const color = isSelected ? '#00FF00' : '#666666';
        
        return (
          <group key={zone.name}>
            {/* Zone marker */}
            {/* <mesh position={zone.position}>
              <cylinderGeometry args={[isSelected ? 3 : 2, isSelected ? 3 : 2, 0.3, 8]} />
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={isSelected ? 0.9 : 0.4}
              />
            </mesh> */}
            
            {/* Zone label pole */}
            {/* <mesh position={[zone.position[0], 3, zone.position[2]]}>
              <boxGeometry args={[0.2, 6, 0.2]} />
              <meshBasicMaterial color={color} />
            </mesh> */}
            
            {/* Label background */}
            {/* <mesh position={[zone.position[0], 6, zone.position[2]]}>
              <boxGeometry args={[6, 1, 0.1]} />
              <meshBasicMaterial color={isSelected ? '#00FF00' : '#333333'} />
            </mesh> */}
          </group>
        );
      })}
      
      {/* Power indicator rings */}
      {/* <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
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
       */}
      {/* Boundary circle */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[25, 27, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export default CricketGame;