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
  
  // Ball outcome graphics state
  const [showOutcomeGraphics, setShowOutcomeGraphics] = useState(false);
  const [currentBallOutcome, setCurrentBallOutcome] = useState(null);
  
  // Bowling validation message state
  const [showBowlingValidationMessage, setShowBowlingValidationMessage] = useState(false);
  const [bowlingValidationMessage, setBowlingValidationMessage] = useState('');
  
  // ✅ ENHANCED: Timer management for auto-shot fallbacks
  const [activeFallbackTimers, setActiveFallbackTimers] = useState(new Set());
  
  const [selectedShotDirection, setSelectedShotDirection] = useState('straight');
  
  // Handle ball outcome graphics completion
  const handleOutcomeGraphicsComplete = useCallback(() => {
    setShowOutcomeGraphics(false);
    setCurrentBallOutcome(null);
  }, []);
  
  // ✅ ENHANCED: Clear all active fallback timers
  const clearAllFallbackTimers = useCallback(() => {
    activeFallbackTimers.forEach(timerId => {
      clearTimeout(timerId);
    });
    setActiveFallbackTimers(new Set());
  }, [activeFallbackTimers]);

  // ✅ ENHANCED: Add timer to active timers set
  const addFallbackTimer = useCallback((timerId) => {
    setActiveFallbackTimers(prev => new Set([...prev, timerId]));
  }, []);

  // Show bowling validation message
  const showBowlingMessage = useCallback((message, duration = 2000) => {
    setBowlingValidationMessage(message);
    setShowBowlingValidationMessage(true);
    
    setTimeout(() => {
      setShowBowlingValidationMessage(false);
      setBowlingValidationMessage('');
    }, duration);
  }, []);
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
    
    // Create new game state based on dummy data
    const newGameState = {
      ...createInitialGameState(),
      gameState: dummyData.gameState.gameState,
      ballState: dummyData.gameState.ballState,
      canBat: dummyData.gameState.canBat,
      formatId: dummyData.gameState.formatId,
      score: dummyData.gameState.score,
      currentBall: dummyData.gameState.currentBall,
      players: {
        ...dummyData.players,
        fielders: dummyData.players.fielders || []
      },
      controls: dummyData.controls,
      lastAction: dummyData.gameState.lastAction,
      BallOutcome: dummyData.gameState.BallOutcome, // Include BallOutcome from dummy data
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
    
    // Trigger graphics if BallOutcome is present in dummy data
    if (dummyData.gameState.BallOutcome) {
      console.log('🎮 Dummy data contains BallOutcome, triggering graphics:', dummyData.gameState.BallOutcome);
      setTimeout(() => {
        triggerOutcomeGraphics();
      }, 1000); // 1s delay to ensure state is set
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
    
    // ✅ ENHANCED: Clear all fallback timers when ball is reset
    clearAllFallbackTimers();
    
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
  }, [clearAllFallbackTimers]);

  // 🏏 REALISTIC BOWLING HANDLER with Run-up and Ball Release Coordination
  const handleBowl = useCallback(() => {
    if (gameState.gameState !== GAME_STATES.WAITING_FOR_BALL) {
      console.log('⚠️ Cannot bowl - game not in WAITING_FOR_BALL state');
      showBowlingMessage('🏏 Game not ready for bowling', 1500);
      return;
    }

    const { controls } = gameState;
    const bowlingControls = controls?.bowling;
    
    // ✅ ENHANCED: Validate bowling controls before proceeding
    if (!bowlingControls) {
      console.error('❌ Cannot bowl - no bowling controls available');
      showBowlingMessage('🏏 Bowling data not configured', 2000);
      return;
    }
    
    // ✅ ENHANCED: Validate required bowling parameters
    const requiredParams = ['velocity', 'ball_axis_x', 'ball_axis_y', 'length_axis_x', 'length_axis_z', 'line_axis_x', 'line_axis_z'];
    const missingParams = requiredParams.filter(param => bowlingControls[param] === undefined || bowlingControls[param] === null);
    
    if (missingParams.length > 0) {
      console.error('❌ Cannot bowl - missing required parameters:', missingParams);
      showBowlingMessage(`🏏 Missing bowling data: ${missingParams.join(', ')}`, 2500);
      return;
    }
    
    // ✅ ENHANCED: Validate bowling parameters are not zero/invalid
    const invalidParams = requiredParams.filter(param => {
      const value = bowlingControls[param];
      return value === 0 || value === null || value === undefined || isNaN(value);
    });
    
    if (invalidParams.length > 0) {
      console.error('❌ Cannot bowl - invalid bowling parameters:', invalidParams);
      showBowlingMessage(`🏏 Invalid bowling data: ${invalidParams.join(', ')}`, 2500);
      return;
    }
    
    // Calculate enhanced ball trajectory using pitch analysis
    const trajectory = calculateBallTrajectory(bowlingControls);
    
    // ✅ ENHANCED: Validate trajectory data
    if (!trajectory || !trajectory.initial || !trajectory.bounce || !trajectory.target) {
      console.error('❌ Cannot bowl - invalid trajectory calculated');
      showBowlingMessage('🏏 Cannot calculate ball trajectory', 2000);
      return;
    }
    
    // 🏃‍♂️ START RUN-UP ANIMATION - Trigger realistic bowling sequence
    setGameState(prevState => updateGameState(prevState, {
      type: 'START_BOWLING',
      bowlingAnimation: 'runUp', // Start with run-up animation
      ballData: trajectory // Store trajectory for later use
    }));

    // ✅ ENHANCED: Store trajectory data for ball release with validation
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
    
    console.log('✅ Pending ball data stored successfully:', window.pendingBallData);

  }, [gameState, showBowlingMessage]);

  // 🎯 BALL RELEASE HANDLER - Called by bowler animation at the right moment
  const handleBallRelease = useCallback(() => {
    console.log('🎯🎯🎯 BALL RELEASE HANDLER CALLED! 🎯🎯🎯');
    console.log('Pending ball data:', window.pendingBallData);
    
    // ✅ ENHANCED: Add safety checks and fallback mechanisms
    if (!window.pendingBallData) {
      console.error('❌ No pending ball data found! Attempting to recover...');
      
      // Try to recover by checking if we can get data from current game state
      const currentGameState = gameState;
      if (currentGameState.controls?.bowling) {
        console.log('🔄 Attempting to recreate pending ball data from current state...');
        
        const bowlingControls = currentGameState.controls.bowling;
        const trajectory = calculateBallTrajectory(bowlingControls);
        
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
        
        console.log('✅ Successfully recreated pending ball data');
      } else {
        console.error('❌ Cannot recover - no bowling controls available');
        return; // Exit if we can't recover
      }
    }
    
    console.log('✅ Releasing ball with pending data');
    
    // 🏏 CRITICAL: Ball releases from ACTUAL release position from bowling data
    // Use the exact release_z coordinate from the bowling configuration
    const releaseZ = window.pendingBallData.pitchAnalysis?.release_z || 
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
  }, [gameState]); // ✅ FIXED: Added gameState dependency

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

    // 🎯 Helper function to trigger ball outcome graphics
  const triggerOutcomeGraphics = useCallback(() => {
    console.log('🎮 triggerOutcomeGraphics called');
    
    // Use BallOutcome data from gameState as primary source
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
      setCurrentBallOutcome(outcomeData);
      setShowOutcomeGraphics(true);
    } else if (lastAction) {
      // Fallback to lastAction data
      const outcomeData = {
        runs: lastAction.runs || 0,
        isBoundary: lastAction.type === 'boundary' || false,
        details: lastAction.description || ""
      };
      
      // Only trigger graphics if we have meaningful data
      if (outcomeData.runs > 0 || outcomeData.details) {
        console.log('🎮 Triggering ball outcome graphics from lastAction:', outcomeData);
        setCurrentBallOutcome(outcomeData);
        setShowOutcomeGraphics(true);
      } else {
        console.log('🎮 Skipping graphics - incomplete lastAction data:', outcomeData);
      }
    } else if (currentBall) {
      // Fallback to currentBall data if lastAction is not available
      const outcomeData = {
        runs: currentBall.runs || 0,
        isBoundary: currentBall.Isboundary || false,
        details: currentBall.Details || ""
      };
      
      // Only trigger graphics if we have meaningful data
      if (outcomeData.runs > 0 || outcomeData.details) {
        console.log('🎮 Triggering ball outcome graphics from currentBall:', outcomeData);
        setCurrentBallOutcome(outcomeData);
        setShowOutcomeGraphics(true);
      } else {
        console.log('🎮 Skipping graphics - incomplete currentBall data:', outcomeData);
      }
    } else {
      console.log('🎮 No data available for graphics');
    }
  }, [gameState.BallOutcome, gameState.lastAction, gameState.currentBall]);

  const handleBallCatch = useCallback((catchData) => {
    
    if (catchData.type === 'catch') {
      // Wicket taken
      setGameState(prevState => updateGameState(prevState, {
        type: 'UPDATE_SCORE',
        scoreUpdate: { wickets: prevState.score.wickets + 1 }
      }));
    } else if (catchData.type === 'collect') {
      if (catchData.playerId === 'wicket_keeper') {
        // Ball collected by keeper - reset all states and return to bowler immediately
        triggerOutcomeGraphics();
        
        // ✅ ENHANCED: Clear all fallback timers when keeper collects ball
        clearAllFallbackTimers();
        
        // ✅ Reset ALL active states and bring ball to bowler
        setGameState(prevState => {
          // Reset to initial game state with ball at bowler
          const resetState = {
            ...prevState,
            gameState: GAME_STATES.WAITING_FOR_BALL,
            ballState: BALL_STATES.WITH_BOWLER,
            canBat: false,
            bowlingAnimation: null,
            bowlingSequenceActive: false,
            pendingBallData: null,
            currentBall: {
              position: prevState.players.bowler.position,
              velocity: [0, 0, 0],
              isMoving: false,
              trajectory: []
            },
            players: {
              ...prevState.players,
              striker: {
                ...prevState.players.striker,
                state: PLAYER_STATES.READY,
                animation: null
              },
              nonStriker: {
                ...prevState.players.nonStriker,
                state: PLAYER_STATES.IDLE,
                animation: null
              },
              bowler: {
                ...prevState.players.bowler,
                state: PLAYER_STATES.READY,
                animation: null
              },
              wicketKeeper: {
                ...prevState.players.wicketKeeper,
                state: PLAYER_STATES.READY,
                animation: null
              }
            },
            lastAction: null,
            animations: {
              active: [],
              queue: []
            }
          };
          
          console.log('🔄 Keeper collection: Resetting all states and bringing ball to bowler');
          
          // Immediately reset ball to bowler position
          setTimeout(() => {
            // Clear any global state
            if (typeof window !== 'undefined') {
              window.pendingBallData = null;
              window.deterministicTarget = null;
            }
            
            setGameState(prevState => ({
              ...prevState,
              ballState: BALL_STATES.WITH_BOWLER,
              currentBall: {
                position: prevState.players.bowler.position,
                velocity: [0, 0, 0],
                isMoving: false,
                trajectory: []
              }
            }));
          }, 100); // Small delay for graphics
          
          return resetState;
        });
        
      } else if (catchData.playerId === 'bowler' || catchData.reason === 'reset_to_bowler') {
        // Ball reset to bowler (for boundary, max distance, etc.) - show graphics first
        
        // If this is a shot completion, determine runs scored based on distance
        if (catchData.reason === 'shot_distance_reached' && catchData.shotDistance) {
          const shotDistance = catchData.shotDistance;
          let runs = 0;
          let description = '';
          
          // Determine runs based on shot distance
          if (shotDistance >= 50) {
            runs = 6;
            description = 'Hit over the boundary for six';
          } else if (shotDistance >= 40) {
            runs = 4;
            description = 'Driven through covers for four';
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
          
          // Set BallOutcome for graphics
          setGameState(prevState => {
            const updatedState = updateGameState(prevState, {
              type: 'SET_BALL_OUTCOME',
              outcome: {
                type: runs >= 4 ? 'boundary' : 'shot',
                runs: runs,
                description: description
              }
            });
            
            // Update lastAction with shot result
            const finalState = {
              ...updatedState,
              lastAction: {
                type: runs >= 4 ? 'boundary' : 'shot',
                runs: runs,
                description: description,
                shotType: 'drive',
                source: 'auto-shot'
              }
            };
            
            // Update score if runs were scored
            if (runs > 0) {
              return updateGameState(finalState, {
                type: 'UPDATE_SCORE',
                scoreUpdate: { runs: prevState.score.runs + runs }
              });
            }
            
            return finalState;
          });
        }
        
        triggerOutcomeGraphics();
        
        // Delay the reset to allow graphics to complete
        setTimeout(() => {
          resetBallToBowler(catchData.reason || 'reset_to_bowler');
        }, 2500); // 2.5 seconds for graphics
        
      } else {
        // Ball fielded by other player - show graphics then handle fielding
        triggerOutcomeGraphics();
        setTimeout(() => {
          handleFielding();
        }, 2500);
      }
    } else {
      // Ball fielded - show graphics first
      triggerOutcomeGraphics();
      setTimeout(() => {
        handleFielding();
      }, 2500);
    }
  }, [handleFielding, resetBallToBowler, gameState.currentBall]);



  const handleBallReachTarget = useCallback((targetData) => {
    if (targetData.target === 'batsman') {
      // ✅ ENHANCED: Calculate distance between ball and striker position with comprehensive checks
      const ballPos = targetData.position;
      const strikerPos = [0, 0, -9]; // Striker position
      
      // ✅ SAFETY CHECK: Ensure ballPos is valid
      if (!ballPos || !Array.isArray(ballPos) || ballPos.length < 3) {
        console.warn('⚠️ handleBallReachTarget: Invalid ballPos', ballPos);
        return;
      }
      
      const ballZ = ballPos[2];
      const strikerZ = strikerPos[2];
      const distanceZ = Math.abs(ballZ - strikerZ); // Distance along Z-axis only
      
      // ✅ ENHANCED: Also calculate full 3D distance for better accuracy
      const fullDistance = Math.sqrt(
        Math.pow(ballPos[0] - strikerPos[0], 2) + 
        Math.pow(ballPos[1] - strikerPos[1], 2) + 
        Math.pow(ballPos[2] - strikerPos[2], 2)
      );
      
      console.log(`🎯 BALL REACHED BATSMAN! Ball Z: ${ballZ.toFixed(1)}, Striker Z: ${strikerZ}, Z-Distance: ${distanceZ.toFixed(1)}m, Full Distance: ${fullDistance.toFixed(1)}m`);
      
      // ✅ ENHANCED: Check if autoPlay is enabled with multiple distance thresholds
      const ballShotConfig = gameState.controls?.ballShot;
      if (!ballShotConfig) {
        console.warn('⚠️ handleBallReachTarget: ballShotConfig is missing');
        return;
      }
      
      // ✅ ENHANCED: Multiple trigger conditions for maximum reliability
      const zDistanceTrigger = distanceZ <= 3.0;
      const fullDistanceTrigger = fullDistance <= 4.0; // Slightly larger threshold for 3D distance
      const autoPlayEnabled = ballShotConfig.autoPlay === true;
      
      const shouldAutoShot = autoPlayEnabled && (zDistanceTrigger || fullDistanceTrigger);
      
      console.log(`🤖 ENHANCED Auto-shot check:`, {
        autoPlay: autoPlayEnabled,
        zDistance: distanceZ.toFixed(1),
        fullDistance: fullDistance.toFixed(1),
        zDistanceTrigger: zDistanceTrigger,
        fullDistanceTrigger: fullDistanceTrigger,
        shouldAutoShot: shouldAutoShot
      });
      
      setGameState(prevState => ({
        ...prevState,
        ballState: BALL_STATES.BOWLING, // Keep as bowling until hit
        canBat: true // Enable batting when ball is close
      }));
      
      if (shouldAutoShot) {
        console.log('🚀 EXECUTING AUTO-SHOT - Batsman MUST hit the ball!');
        
        // ✅ ENHANCED: Immediate execution with multiple fallback mechanisms
        const executeAutoShot = () => {
          try {
            // ✅ SAFETY CHECK: Ensure we have valid configuration
            const ballShotConfig = gameState.controls?.ballShot;
            if (!ballShotConfig) {
              console.error('❌ Auto-shot failed: ballShotConfig is missing');
              return false;
            }
            
            const targetDistance = parseFloat(ballShotConfig.distance) || 15; // Default to 15m if not specified
            const angle = ballShotConfig.degree || 0;
            const isLofted = ballShotConfig.lofted || false;
            const elevation = isLofted ? 8.0 : 0.5;
            
            console.log('🎯 Auto-shot parameters:', {
              targetDistance,
              angle,
              isLofted,
              elevation
            });
            
            // ✅ ENHANCED: Use calculateShotVector with error handling
            let scaledVelocity;
            try {
              scaledVelocity = calculateShotVector(angle, targetDistance, elevation, '🤖 AUTO');
              console.log('✅ Shot vector calculated successfully:', scaledVelocity);
            } catch (error) {
              console.error('❌ Auto-shot failed: calculateShotVector error:', error);
              // Fallback to simple shot vector
              scaledVelocity = [0, 5, 10]; // Simple forward shot
            }
            
            // ✅ ENHANCED: Execute auto shot with comprehensive state update
            setGameState(prevState => {
              console.log('🔄 Updating game state for auto-shot...');
              
              // Position ball at striker and apply the shot
              const updatedState = {
                ...prevState,
                currentBall: {
                  ...prevState.currentBall,
                  position: [0, 0.5, -9], // Striker's position
                  velocity: [0, 0, 0] // Reset velocity before shot
                },
                canBat: false // Disable manual batting during auto-shot
              };
              
                             // Apply the ball hit action with the calculated trajectory
               const finalState = updateGameState(updatedState, {
                 type: 'BALL_HIT',
                 payload: {
                   newVelocity: scaledVelocity,
                   trajectory: scaledVelocity,
                   isRunnable: targetDistance > 5,
                   shotType: isLofted ? 'loft' : ballShotConfig.type || 'drive',
                   shotDirection: `${angle}°`,
                   startPosition: [0, 0.5, -9], // Ensure shot starts from striker
                   targetDistance, // For verification
                   source: 'auto-shot' // Track that this is an auto-shot
                 }
               });
              
              console.log('✅ Auto-shot state updated successfully:', finalState.ballState);
              return finalState;
            });
            
            return true; // Success
          } catch (error) {
            console.error('❌ Auto-shot execution failed:', error);
            return false;
          }
        };
        
        // ✅ ENHANCED: Multiple execution attempts with different delays
        let shotExecuted = false;
        
        // Attempt 1: Immediate execution
        shotExecuted = executeAutoShot();
        
        // Attempt 2: After 50ms delay (if first attempt failed)
        if (!shotExecuted) {
          setTimeout(() => {
            console.log('🔄 Auto-shot retry attempt 1...');
            shotExecuted = executeAutoShot();
          }, 50);
        }
        
        // Attempt 3: After 100ms delay (final attempt)
        setTimeout(() => {
          if (!shotExecuted) {
            console.log('🔄 Auto-shot retry attempt 2 (final)...');
            executeAutoShot();
          }
        }, 100);
        
        // ✅ ENHANCED: Multiple aggressive fallback mechanisms with timer management
        const fallbackTimeouts = [2000, 5000, 8000, 15000]; // Increased final timeout to 15s
        
        fallbackTimeouts.forEach((timeout, index) => {
          const timerId = setTimeout(() => {
            const currentBallState = gameState.ballState;
            console.log(`🔄 Auto-shot fallback check ${index + 1} (${timeout}ms): ballState = ${currentBallState}`);
            
            // ✅ ENHANCED: Check if ball is still bowling before taking action
            if (currentBallState === BALL_STATES.BOWLING) {
              console.log(`⚠️ Auto-shot fallback ${index + 1}: Ball still bowling, forcing shot execution`);
              
              // Force auto-shot execution as last resort
              const ballShotConfig = gameState.controls?.ballShot;
              if (ballShotConfig?.autoPlay) {
                console.log('🚀 FORCING AUTO-SHOT EXECUTION as fallback!');
                executeAutoShot();
              } else {
                console.log('🔄 Resetting ball to bowler due to fallback');
                setGameState(prevState => updateGameState(prevState, {
                  type: 'BALL_WITH_BOWLER'
                }));
              }
            } else {
              console.log(`✅ Ball state changed to ${currentBallState}, skipping fallback ${index + 1}`);
            }
          }, timeout);
          
          // Add timer to active timers set for cleanup
          addFallbackTimer(timerId);
        });
      } else {
        console.log('⚠️ Auto-shot not triggered - ball too far or autoPlay disabled');
        
        // ✅ ENHANCED: Check if autoPlay is actually enabled but distance check failed
        const ballShotConfig = gameState.controls?.ballShot;
        if (ballShotConfig?.autoPlay === true) {
          console.log('🚨 CRITICAL: AutoPlay is TRUE but shot not triggered - forcing execution!');
          
          // Force auto-shot even if distance check failed
          setTimeout(() => {
            console.log('🚀 FORCING AUTO-SHOT despite distance check failure!');
            executeAutoShot();
          }, 500);
        }
        
        // ✅ ENHANCED: Multiple fallback timeouts for non-auto-shot cases with timer management
        const fallbackTimeouts = [3000, 6000, 9000, 15000]; // Increased final timeout to 15s
        
        fallbackTimeouts.forEach((timeout, index) => {
          const timerId = setTimeout(() => {
            const currentBallState = gameState.ballState;
            console.log(`🔄 Non-auto-shot fallback ${index + 1} (${timeout}ms): ballState = ${currentBallState}`);
            
            // ✅ ENHANCED: Check if ball is still bowling before taking action
            if (currentBallState === BALL_STATES.BOWLING) {
              console.log(`🔄 Fallback reset ${index + 1}: Ball not hit, resetting to bowler`);
              setGameState(prevState => updateGameState(prevState, {
                type: 'BALL_WITH_BOWLER'
              }));
            } else {
              console.log(`✅ Ball state changed to ${currentBallState}, skipping non-auto-shot fallback ${index + 1}`);
            }
          }, timeout);
          
          // Add timer to active timers set for cleanup
          addFallbackTimer(timerId);
        });
      }
    } else if (targetData.target === 'final_coordinate') {
      // Ball reached final coordinate in direct coordinate mode
      console.log('🎯 Ball reached final coordinate - checking for auto-reset');
      
      // Get shot distance from deterministic target for runs calculation
      const deterministicTarget = typeof window !== 'undefined' ? window.deterministicTarget : null;
      const shotDistance = deterministicTarget?.exactDistance || 0;
      
      if (shotDistance > 0) {
        // Determine runs based on shot distance
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
        
        // Set BallOutcome for graphics
        setGameState(prevState => {
          const updatedState = updateGameState(prevState, {
            type: 'SET_BALL_OUTCOME',
            outcome: {
              type: outcomeType,
              runs: runs,
              description: description
            }
          });
          
          // Update score if runs were scored
          if (runs > 0) {
            return updateGameState(updatedState, {
              type: 'UPDATE_SCORE',
              scoreUpdate: { runs: prevState.score.runs + runs }
            });
          }
          
          return updatedState;
        });
      }
      
      // 🎮 TRIGGER BALL OUTCOME GRAPHICS when ball reaches destination (with delay to ensure state update)
      setTimeout(() => {
        console.log('🎮 About to trigger graphics after ball reached destination');
        triggerOutcomeGraphics();
      }, 1500); // 1.5s delay to ensure state update completes
      
      // ✅ ALWAYS reset after final coordinate to prevent stuck state
      const ballShotConfig = gameState.controls?.ballShot;
      const resetDelay = ballShotConfig?.resetDelay || 15000; // Default 15s delay (increased from 10s)
      
              console.log(`🔄 Auto-resetting ball to bowler after ${resetDelay/1000}s`);
      
      setTimeout(() => {
        console.log('🔄 Executing auto-reset to bowler');
        setGameState(prevState => updateGameState(prevState, {
          type: 'BALL_WITH_BOWLER'
        }));
      }, resetDelay);
    } else if (targetData.target === 'boundary') {
      // Boundary scored
      const boundaryDescription = targetData.runs === 6 ? 
        'Hit over the boundary for six' : 
        'Driven through covers for four';
      
      setGameState(prevState => {
        const updatedState = updateGameState(prevState, {
          type: 'UPDATE_SCORE',
          scoreUpdate: { runs: prevState.score.runs + targetData.runs }
        });
        
        // Set BallOutcome for graphics
        const finalState = updateGameState(updatedState, {
          type: 'SET_BALL_OUTCOME',
          outcome: {
            type: 'boundary',
            runs: targetData.runs,
            description: boundaryDescription
          }
        });
        
        // Update lastAction to reflect boundary result
        return {
          ...finalState,
          lastAction: {
            type: 'boundary',
            runs: targetData.runs,
            description: boundaryDescription
          }
        };
      });
      
      // 🎮 TRIGGER BALL OUTCOME GRAPHICS for boundary (with small delay)
      setTimeout(() => {
        triggerOutcomeGraphics();
      }, 500); // 0.5s delay to ensure ball has settled
      
      // Return ball to bowler after boundary
      setTimeout(() => {
        setGameState(prevState => updateGameState(prevState, {
          type: 'BALL_WITH_BOWLER'
        }));
      }, 7000); // Increased from 10s to 15s for consistency
    }
  }, [gameState.controls.ballShot]); // Add ballShot config to dependencies

  // ✅ ENHANCED: Monitor ball state changes and clear fallback timers when ball is reset
  useEffect(() => {
    const currentBallState = gameState.ballState;
    
    // Clear all fallback timers when ball is no longer bowling
    if (currentBallState !== BALL_STATES.BOWLING) {
      clearAllFallbackTimers();
    }
  }, [gameState.ballState, clearAllFallbackTimers]);

  // ✅ ENHANCED: Global auto-shot monitoring system
  useEffect(() => {
    const ballShotConfig = gameState.controls?.ballShot;
    const isAutoPlayEnabled = ballShotConfig?.autoPlay === true;
    const isBallBowling = gameState.ballState === BALL_STATES.BOWLING;
    const isBallMoving = gameState.currentBall?.isMoving;
    
    // Monitor for stuck bowling state with autoPlay enabled
    if (isAutoPlayEnabled && isBallBowling && isBallMoving) {
      const monitorTimeout = setTimeout(() => {
        console.log('🚨 AUTO-SHOT MONITOR: Ball stuck in bowling state with autoPlay enabled!');
        console.log('🚨 Current state:', {
          ballState: gameState.ballState,
          isMoving: gameState.currentBall?.isMoving,
          autoPlay: ballShotConfig?.autoPlay,
          ballPosition: gameState.currentBall?.position
        });
        
        // ✅ ENHANCED: Check if ball is still bowling before forcing auto-shot
        if (gameState.ballState !== BALL_STATES.BOWLING) {
          console.log('✅ Ball state changed, skipping forced auto-shot');
          return;
        }
        
        // Force auto-shot execution if ball is stuck
        const executeAutoShot = () => {
          try {
            const targetDistance = parseFloat(ballShotConfig.distance) || 15;
            const angle = ballShotConfig.degree || 0;
            const isLofted = ballShotConfig.lofted || false;
            const elevation = isLofted ? 8.0 : 0.5;
            
            const scaledVelocity = calculateShotVector(angle, targetDistance, elevation, '🚨 MONITOR FORCE');
            
            setGameState(prevState => {
              const updatedState = {
                ...prevState,
                currentBall: {
                  ...prevState.currentBall,
                  position: [0, 0.5, -9],
                  velocity: [0, 0, 0]
                }
              };
              
              return updateGameState(updatedState, {
                type: 'BALL_HIT',
                payload: {
                  newVelocity: scaledVelocity,
                  trajectory: scaledVelocity,
                  isRunnable: targetDistance > 5,
                  shotType: isLofted ? 'loft' : 'drive',
                  shotDirection: `${angle}°`,
                  startPosition: [0, 0.5, -9],
                  targetDistance,
                  source: 'monitor-force' // Track that this is a monitor-forced shot
                }
              });
            });
            
            console.log('✅ MONITOR: Forced auto-shot execution successful');
          } catch (error) {
            console.error('❌ MONITOR: Forced auto-shot failed:', error);
          }
        };
        
        executeAutoShot();
      }, 5000); // Monitor after 5 seconds
      
      return () => clearTimeout(monitorTimeout);
    }
  }, [gameState.ballState, gameState.currentBall?.isMoving, gameState.controls?.ballShot?.autoPlay]);

  // ✅ ENHANCED: Bowling sequence monitoring system
  useEffect(() => {
    const isBowlingSequenceActive = gameState.bowlingSequenceActive;
    const isBallBowling = gameState.ballState === BALL_STATES.BOWLING;
    
    // Monitor for stuck bowling sequence (bowler animation running but no ball release)
    if (isBowlingSequenceActive && isBallBowling) {
      const bowlingMonitorTimeout = setTimeout(() => {
        console.log('🚨 BOWLING MONITOR: Bowling sequence stuck - no ball release detected!');
        console.log('🚨 Current state:', {
          bowlingSequenceActive: gameState.bowlingSequenceActive,
          ballState: gameState.ballState,
          pendingBallData: window.pendingBallData ? 'exists' : 'missing'
        });
        
        // Force ball release if bowling sequence is stuck
        if (window.pendingBallData) {
          console.log('🔄 BOWLING MONITOR: Forcing ball release...');
          handleBallRelease();
        } else {
          console.log('🔄 BOWLING MONITOR: No pending ball data - resetting bowling sequence');
          setGameState(prevState => updateGameState(prevState, {
            type: 'BALL_WITH_BOWLER'
          }));
        }
      }, 8000); // Monitor after 8 seconds
      
      return () => clearTimeout(bowlingMonitorTimeout);
    }
  }, [gameState.bowlingSequenceActive, gameState.ballState]);

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

  // Create fielder positions - Use game state fielders if available, otherwise use dynamic positions
  const fielderPositions = React.useMemo(() => {
    // If we have fielders in game state (from dummy data or dynamic generation), use those
    if (gameState.players?.fielders && gameState.players.fielders.length > 0) {
      return gameState.players.fielders.map(fielder => ({
        position: fielder.position,
        role: fielder.role || 'fielding',
        id: fielder.id,
        name: fielder.name
      }));
    }
    
    // Fallback to static/dynamic positions if no fielders in game state
    return [
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
  }, [gameState.players?.fielders, positions]);

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
        playShot,
        // Ball outcome graphics state
        showOutcomeGraphics,
        currentBallOutcome,
        handleOutcomeGraphicsComplete,
        // Bowling validation message state
        showBowlingValidationMessage,
        bowlingValidationMessage
      });
    }
  }, [
    gameState, isPlaying, selectedShotDirection, selectedShotType, shotAngle,
    useCompactUI, showPitchMarkers, showCoordinateDisplay, showPitchGrid, showZoneMarkers, currentView,
    onGameStateChange, updateBowlingControls, handleBowlingConfigUpdate, handleBallShotConfigUpdate,
    resetBallToBowler, switchToView, playShot, showOutcomeGraphics, currentBallOutcome, handleOutcomeGraphicsComplete,
    showBowlingValidationMessage, bowlingValidationMessage, clearAllFallbackTimers, addFallbackTimer
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

      {/* Ball Outcome Graphics - Rendered outside canvas in App.jsx */}

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