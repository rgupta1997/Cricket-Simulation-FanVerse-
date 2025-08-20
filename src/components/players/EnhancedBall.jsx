/* eslint-disable react/no-unknown-property */
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import BallPositionMarker from '../BallPositionMarker';

const EnhancedBall = ({ 
  gameState, 
  onBounce, 
  onCatch, 
  onReachTarget,
  showTrajectory = false,
  onBallPositionUpdate 
}) => {
  const ballRef = useRef();
  const [trail, setTrail] = useState([]);
  const [bounceCount, setBounceCount] = useState(0);
  const [shotStartPosition, setShotStartPosition] = useState(null); // Track where shot started
  
  // Direct coordinate movement state
  const [currentWaypoint, setCurrentWaypoint] = useState(0); // 0=release, 1=bounce, 2=final
  const [trajectoryProgress, setTrajectoryProgress] = useState(0); // 0-1 between waypoints
  const [physicsMode, setPhysicsMode] = useState(false); // Enable physics after reaching final
  const [trajectoryStartTime, setTrajectoryStartTime] = useState(null);
  
  const { currentBall, ballState } = gameState;
  const { position, velocity, isMoving } = currentBall;

  // Physics constants for cricket ball
  const GRAVITY = -9.81; // Real world gravity
  const AIR_RESISTANCE = 0.995; // Slight air resistance
  const BOUNCE_DAMPING = 0.6; // 60% energy retention on bounce
  const GROUND_LEVEL = 0.07; // Ball radius
  const SPIN_FACTOR = 2.5; // Ball spin multiplier

  // Reset trajectory state when coordinates change
  useEffect(() => {
    const trajectory = currentBall.trajectory;
    if (trajectory?.metadata?.useDirectCoordinates) {
      // Reset all trajectory state when new coordinates are provided
      setCurrentWaypoint(0);
      setTrajectoryProgress(0);
      setPhysicsMode(false);
      setTrajectoryStartTime(null);
      setBounceCount(0);
      setShotStartPosition(null);
      setTrail([]);
    }
  }, [currentBall.trajectory]);

  // Reset trajectory state when ball starts moving
  useEffect(() => {
    if (isMoving && !trajectoryStartTime) {
      setCurrentWaypoint(0);
      setTrajectoryProgress(0);
      setPhysicsMode(false);
      setTrajectoryStartTime(Date.now());
      setBounceCount(0);
      
      // Check if this is a shot (ball state is 'hit')
      if (ballState === 'hit') {
        setShotStartPosition(new Vector3(...position));
      }
    } else if (!isMoving) {
      // Ball stopped - reset trajectory state completely
      setTrajectoryStartTime(null);
      setPhysicsMode(false);
      setCurrentWaypoint(0);
      setTrajectoryProgress(0);
      setBounceCount(0);
      setShotStartPosition(null);
    }
  }, [isMoving, trajectoryStartTime, ballState, position]);

  // Update camera with ball position when it changes
  useEffect(() => {
    if (onBallPositionUpdate && position) {
      const ballPos = Array.isArray(position) 
        ? position 
        : [position?.x || 0, position?.y || 0, position?.z || 0];
      onBallPositionUpdate(ballPos);
    }
  }, [position, onBallPositionUpdate]);

  useFrame((state, delta) => {
    if (!ballRef.current || !isMoving) return;
    
    const ball = ballRef.current;
    const trajectory = currentBall.trajectory;
    const useDirectCoordinates = trajectory?.metadata?.useDirectCoordinates;
    
    // ✅ COMPREHENSIVE NULL SAFETY - Prevent "can't access property 'x', v is null" errors
    if (!currentBall || currentBall.position === null || currentBall.velocity === null) {
      console.warn('⚠️ Ball animation: currentBall data is null, skipping frame');
      return;
    }
    
    // Check if we should use direct coordinate movement or physics
    if (useDirectCoordinates && !physicsMode) {
      // DIRECT COORDINATE MODE - Ball follows exact path through specified coordinates
      const waypoints = [
        new Vector3(...trajectory.initial.position),   // Release
        new Vector3(...trajectory.bounce.position),    // Bounce  
        new Vector3(...trajectory.target.position)     // Final
      ];
      
      // Check if trajectory is complete (reached all waypoints)
      if (currentWaypoint >= waypoints.length - 1) {
        // Trajectory complete - ball should remain at final position
        const finalPosition = waypoints[waypoints.length - 1];
        ball.position.copy(finalPosition);
        return; // Stop all movement - no physics mode
      }
      
      if (currentWaypoint < waypoints.length - 1) {
        // Move between current waypoint and next waypoint
        const startPoint = waypoints[currentWaypoint];
        const endPoint = waypoints[currentWaypoint + 1];
        
        // Calculate movement speed based on desired timing
        const segmentDuration = currentWaypoint === 0 ? 1.0 : 0.8; // Release->Bounce: 1s, Bounce->Final: 0.8s
        const moveSpeed = 1 / segmentDuration; // Progress per second
        
        // Update progress
        setTrajectoryProgress(prev => {
          const newProgress = prev + (moveSpeed * delta);
          
          if (newProgress >= 1.0) {
            // Reached next waypoint
            if (currentWaypoint === 0) {
              // Reached bounce point
              if (onBounce) {
                onBounce({
                  position: endPoint.toArray(),
                  velocity: trajectory.bounce.velocity,
                  bounceCount: 1,
                  bounceHeight: currentBall.bounceHeight || 0.5
                });
              }
              setBounceCount(1);
            } else if (currentWaypoint === 1) {
              // Reached final point - STOP the ball (don't enable physics mode for direct coordinates)
              // Stop the ball completely at final coordinate
              ball.position.copy(endPoint);
              
              if (onReachTarget) {
                onReachTarget({
                  target: 'final_coordinate',
                  position: endPoint.toArray(),
                  velocity: [0, 0, 0], // Ball stops at final coordinate
                  distance: 0
                });
              }
              
              // Mark trajectory as complete - no physics mode activation
              setCurrentWaypoint(prev => prev + 1); // This will stop trajectory movement
              return; // Exit early to prevent further movement
            }
            
            setCurrentWaypoint(prev => prev + 1);
            return 0; // Reset progress for next segment
          }
          
          return newProgress;
        });
        
        // Interpolate position between waypoints
        const currentPos = startPoint.clone().lerp(endPoint, trajectoryProgress);
        ball.position.copy(currentPos);
        
        // Update trail
        setTrail(prev => {
          const newTrail = [...prev, currentPos.clone()];
          return newTrail.slice(-20);
        });
        
        // Check for batsman interaction in direct coordinate mode too
        const dummyVelocity = new Vector3(0, 0, 0); // Create Vector3 object instead of array
        checkTargetReached(currentPos, dummyVelocity);
        
        return; // Skip physics when in direct coordinate mode
      }
    }
    
    // PHYSICS MODE or NON-DIRECT COORDINATE MODE
    if (!position || !velocity) return;

    // ✅ SAFE VECTOR CREATION - Handle all possible null/undefined cases
    const currentPos = new Vector3(
      ...(Array.isArray(position) 
        ? position 
        : (position && typeof position === 'object') 
          ? [position.x || 0, position.y || 0.5, position.z || 0]
          : [0, 0.5, 0] // Fallback if position is not an object
      )
    );
    
    const currentVel = new Vector3(
      ...(Array.isArray(velocity) 
        ? velocity 
        : (velocity && typeof velocity === 'object') 
          ? [velocity.x || 0, velocity.y || 0, velocity.z || 0]
          : [0, 0, 0] // Fallback if velocity is not an object
      )
    );
    
    // Apply physics only in physics mode or for non-direct coordinates (but NOT for shots)
    if ((physicsMode || !useDirectCoordinates) && ballState !== 'hit') {
      ball.position.copy(currentPos);
    }

    // IMPORTANT: For shots (hit state), use deterministic control WITHOUT physics interference
    if (ballState === 'hit' && isMoving) {
      // SHOT MODE: Use deterministic distance control without physics
      handleShotMovement(ball, currentPos, currentVel, delta);
      return; // Exit early - no physics for shots
    }
    
    // Apply physics for bowling and returning states only
    if (isMoving && (ballState === 'bowling' || ballState === 'returning') && (physicsMode || !useDirectCoordinates)) {
      // Apply gravity
      currentVel.y += GRAVITY * delta;
      
      // Apply air resistance
      currentVel.multiplyScalar(AIR_RESISTANCE);
      
      // Update position
      currentPos.add(currentVel.clone().multiplyScalar(delta));
      
      // Ground collision detection
      if (currentPos.y <= GROUND_LEVEL && currentVel.y < 0) {
        currentPos.y = GROUND_LEVEL;
        
        // Get bounce parameters from game state (enhanced system)
        const bounceHeight = currentBall.bounceHeight || 0.5;
        const bounceData = currentBall.trajectory?.bounce;
        
        if (bounceData && bounceCount === 0) {
          // First bounce - use pre-calculated bounce velocity from pitch analysis
          currentVel.set(
            bounceData.velocity[0],
            bounceData.velocity[1],
            bounceData.velocity[2]
          );
          

        } else {
          // Subsequent bounces use physics based on pitch characteristics
          const pitchBounce = bounceHeight; // 0 = dead pitch, 2 = normal, 4 = very bouncy
          
          // Calculate bounce energy retention based on pitch characteristics
          const pitchBounceMultiplier = Math.pow(1.2, pitchBounce);
          const dampingFactor = BOUNCE_DAMPING * pitchBounceMultiplier;
          
          // Vertical velocity after bounce
          currentVel.y = Math.abs(currentVel.y) * dampingFactor;
          
          // Horizontal momentum - bouncier pitches retain more pace
          const baseFriction = 0.85; // More base friction for realistic pace drop
          const frictionReduction = Math.min(0.25, pitchBounce * 0.05); // Max 25% friction reduction
          const frictionFactor = baseFriction + frictionReduction;
          
          currentVel.x *= frictionFactor;
          currentVel.z *= frictionFactor;
        }
        
        setBounceCount(prev => prev + 1);
        
        // Trigger bounce callback
        if (onBounce) {
          onBounce({
            position: currentPos.toArray(),
            velocity: currentVel.toArray(),
            bounceCount: bounceCount + 1,
            bounceHeight
          });
        }
      }

      // Update ball position
      ball.position.copy(currentPos);
      
      // This section is now handled in handleShotMovement function
      // Skip distance tracking here as it's moved to shot-specific logic
      /* Disabled - moved to handleShotMovement
      if (ballState === 'hit' && shotStartPosition) {
        const currentDistance = currentPos.distanceTo(shotStartPosition);

        
        // Get deterministic target information
        const deterministicTarget = typeof window !== 'undefined' ? window.deterministicTarget : null;
        
        if (deterministicTarget) {
          // Use DETERMINISTIC system for EXACT stopping distance
          const exactStopDistance = deterministicTarget.exactDistance;
          const stopPosition = new Vector3(...deterministicTarget.finalStopPosition);

          
          console.log('📏 DETERMINISTIC Shot - Current:', currentDistance.toFixed(2), 'Target Stop:', exactStopDistance, 'm');
          
          // Calculate progress toward target (0 = start, 1 = target reached)
          const progressToTarget = currentDistance / exactStopDistance;
          const distanceToStopPosition = currentPos.distanceTo(stopPosition);
          const ballSpeed = currentVel.length();
          
          // ENHANCED PRECISION STOPPING: Smoother deceleration curve
          if (progressToTarget > 0.6) { // Start deceleration earlier at 60%
            // Use sigmoid function for smoother deceleration
            const normalizedProgress = (progressToTarget - 0.6) / 0.4; // Normalize to 0-1 range
            const sigmoid = 1 / (1 + Math.exp(-(normalizedProgress * 6 - 3))); // Smooth S-curve
            const decelerationFactor = Math.max(0.05, 1 - sigmoid);
            
            // Apply stronger deceleration when close to target
            const finalDecel = progressToTarget > 0.9 ? decelerationFactor * 0.8 : decelerationFactor;
            currentVel.multiplyScalar(finalDecel);
            
            console.log(`🎯 Enhanced deceleration: Progress=${(progressToTarget*100).toFixed(1)}%, Decel=${finalDecel.toFixed(3)}, Speed=${ballSpeed.toFixed(2)}`);
          }
          
          // EXACT STOPPING: Enhanced precision for final position
          const reachedExactDistance = currentDistance >= exactStopDistance * 0.99; // 99% accuracy threshold
          const reachedStopPosition = distanceToStopPosition <= 0.25; // More precise position check (0.25m)
          const lowSpeed = ballSpeed < 0.5; // Stricter speed requirement
          const goodTrajectory = Math.abs(currentVel.angleTo(stopPosition.clone().sub(currentPos))) < Math.PI / 4; // Heading toward target
          
          if ((reachedExactDistance || reachedStopPosition) && (progressToTarget > 0.98 || (lowSpeed && goodTrajectory))) {
            // COMPREHENSIVE DEBUG LOGGING FOR FINAL BALL STOP POSITION
            console.group('🎯 EXACT STOP REACHED - FINAL VERIFICATION');
            
            console.log('STOPPING CONDITIONS MET:', {
              reachedExactDistance,
              reachedStopPosition,
              progressToTarget,
              lowSpeed,
              currentDistance: currentDistance.toFixed(3),
              targetDistance: exactStopDistance,
              distanceAccuracy: distanceToStopPosition.toFixed(3)
            });
            
            console.log('INPUT VS OUTPUT COMPARISON:', {
              originalInput: {
                angle: window.deterministicTarget?.angle || 'unknown',
                distance: window.deterministicTarget?.exactDistance || 'unknown'
              },
              actualResult: {
                finalPosition: stopPosition.toArray(),
                calculatedDistance: currentDistance.toFixed(3),
                positionFromStriker: ball.position.toArray()
              },
              differenceAnalysis: {
                distanceDifference: Math.abs(currentDistance - exactStopDistance).toFixed(3),
                positionDifference: distanceToStopPosition.toFixed(3),
                isAccurate: Math.abs(currentDistance - exactStopDistance) < 0.5
              }
            });
            
            if (window.deterministicTarget) {
              const expectedX = window.deterministicTarget.finalStopPosition[0];
              const expectedZ = window.deterministicTarget.finalStopPosition[2];
              const actualX = ball.position.x;
              const actualZ = ball.position.z;
              
              console.log('COORDINATE PRECISION CHECK:', {
                expected: { x: expectedX.toFixed(3), z: expectedZ.toFixed(3) },
                actual: { x: actualX.toFixed(3), z: actualZ.toFixed(3) },
                error: { 
                  x: Math.abs(expectedX - actualX).toFixed(3), 
                  z: Math.abs(expectedZ - actualZ).toFixed(3) 
                },
                totalError: Math.sqrt(Math.pow(expectedX - actualX, 2) + Math.pow(expectedZ - actualZ, 2)).toFixed(3)
              });
            }
            
            console.groupEnd();
            
            console.log('🎯 EXACT STOP REACHED! Distance:', currentDistance.toFixed(2), 'Target:', exactStopDistance, 'Position accuracy:', distanceToStopPosition.toFixed(2), 'm');
            
            // FORCE ball to exact stopping position for perfect precision
            ball.position.copy(stopPosition);
            
            // Stop all movement completely
            if (onBounce) {
              onBounce({
                type: 'position_update',
                position: stopPosition.toArray(),
                velocity: [0, 0, 0],
                isMoving: false
              });
            }
            
            if (onCatch) {
              onCatch({
                type: 'collect',
                playerId: 'bowler',
                position: stopPosition.toArray(),
                reason: 'deterministic_exact_stop'
              });
            }
            
            // Clear deterministic target
            if (typeof window !== 'undefined') {
              window.deterministicTarget = null;
            }
            
            return;
          }
          
          // COURSE CORRECTION: More precise steering toward exact stopping position
          if (progressToTarget > 0.5 && distanceToStopPosition > 0.5) {
            const correctionVector = stopPosition.clone().sub(currentPos).normalize();
            // Gentler correction with exponential falloff
            const correctionStrength = Math.min(1.0, distanceToStopPosition * 0.05) * Math.exp(-progressToTarget);
            currentVel.add(correctionVector.multiplyScalar(correctionStrength * delta));
            console.log('🎯 Precise course correction, distance:', distanceToStopPosition.toFixed(2), 'strength:', correctionStrength.toFixed(3));
          }
          
        } else {
          // Fallback to original distance system if no deterministic target
          const ballShotConfig = gameState.controls?.ballShot;
          const maxDistance = ballShotConfig?.distance || 30;
          
          console.log('📏 Fallback shot distance traveled:', currentDistance.toFixed(2), 'Max:', maxDistance);
          
          const ballSpeed = currentVel.length();
          const isNearlyStoppedAtTarget = ballSpeed < 0.5 && currentDistance >= maxDistance * 0.9;
          
          if (isNearlyStoppedAtTarget || currentDistance >= maxDistance * 1.2) {
            console.log('🎯 Ball reached fallback target distance:', maxDistance, 'm at distance:', currentDistance.toFixed(2), 'speed:', ballSpeed.toFixed(2));
            // Add delay for physics-based collection too
            if (onCatch) {
              setTimeout(() => {
                onCatch({
                  type: 'collect',
                  playerId: 'bowler',
                  position: currentPos.toArray(),
                  reason: 'target_distance_reached'
                });
              }, 3000); // 3 second delay
            }
            return;
          }
        }
      }
      */
      
      // Update game state with new position and velocity
      if (onBounce) {
        onBounce({
          type: 'position_update',
          position: currentPos.toArray(),
          velocity: currentVel.toArray(),
          isMoving: currentVel.length() > 0.1
        });
      }
      
      // Check for batsman interaction when ball is near (only in physics mode)
      if (physicsMode || !useDirectCoordinates) {
        const batsmanPos = new Vector3(0, 0, -10); // Striker at wicket
        const distanceToBatsman = currentPos.distanceTo(batsmanPos);
        
        if (distanceToBatsman < 4 && ballState === 'bowling') {
          console.log('🏏 Ball near batsman! Distance:', distanceToBatsman, 'Ball pos:', currentPos.toArray(), 'Striker pos:', batsmanPos.toArray());
          if (onReachTarget) {
            onReachTarget({
              target: 'batsman',
              position: currentPos.toArray(),
              velocity: currentVel.toArray(),
              distance: distanceToBatsman
            });
          }
        }
      }
      
      // Enhanced ball rotation with spin effects
      const horizontalSpeed = Math.sqrt(currentVel.x**2 + currentVel.z**2);
      
      // Add spin based on velocity components
      ball.rotation.x += horizontalSpeed * delta * SPIN_FACTOR; // Forward rotation
      ball.rotation.y += currentVel.x * delta * SPIN_FACTOR * 0.5; // Side spin
      ball.rotation.z += currentVel.z * delta * SPIN_FACTOR * 0.3; // Drift spin

      // Update trail (only in physics mode to avoid duplicate trail updates)
      if (physicsMode || !useDirectCoordinates) {
        setTrail(prev => {
          const newTrail = [...prev, currentPos.clone()];
          return newTrail.slice(-20); // Keep last 20 positions
        });
      }

      // Check if ball has stopped moving - only auto-collect if explicitly enabled
      if (currentVel.length() < 0.1 && currentPos.y <= GROUND_LEVEL + 0.1) {
          // Check if auto-collection is enabled for stopped balls
          const ballShotConfig = gameState.controls?.ballShot;
          const autoCollectStoppedBall = ballShotConfig?.autoCollectStoppedBall ?? false; // ✅ DEFAULT FALSE
          
          if (autoCollectStoppedBall) {
            // Determine who should collect based on ball's final position
            const ballZ = currentPos.z;
            let collector = 'wicket_keeper';
            
            if (ballZ > -5) {
              // Ball stopped in front area - bowler collects
              collector = 'bowler';
            } else if (ballZ < -15) {
              // Ball stopped far behind wicket - nearest fielder should collect, but for now use bowler
              collector = 'bowler';
            }
            
            if (onCatch) {
              onCatch({
                type: 'collect',
                playerId: collector,
                position: currentPos.toArray(),
                reason: 'ball_stopped'
              });
            }
            return; // Stop further processing
          }
          // ✅ If auto-collection is disabled, ball stays at stopped position
        }

      // Check for catch or pickup
      checkForFielderInteraction(currentPos, currentVel);
      
      // Check if ball has reached target (keeper/fielder)
      checkTargetReached(currentPos, currentVel);
    }
  });

  const checkForFielderInteraction = (ballPos, ballVel) => {
    // Simple proximity check - in a real game this would be more sophisticated
    const fielders = gameState.players.fielders || [];
    const keeper = gameState.players.wicketKeeper;
    
    // Calculate ball speed safely
    const ballSpeed = ballVel && ballVel.length ? ballVel.length() : Math.sqrt(ballVel.x**2 + ballVel.y**2 + ballVel.z**2);
    
    // Check wicket keeper - now works for all ball states (not just 'returning')
    if (ballState === 'returning' || ballState === 'hit') {
      const keeperPos = new Vector3(...keeper.position);
      const distance = ballPos.distanceTo(keeperPos);
      
      // Allow manual collection when ball is close and moving slowly
      if (distance < 2.0 && ballSpeed < 5) {
        if (onCatch) {
          onCatch({
            playerId: 'wicket_keeper',
            position: ballPos.toArray(),
            type: 'collect',
            reason: 'keeper_manual_collect'
          });
        }
      }
    }

    // Check fielders
    fielders.forEach((fielder, index) => {
      const fielderPos = new Vector3(...fielder.position);
      const distance = ballPos.distanceTo(fielderPos);
      
      if (distance < 2.0 && ballSpeed < 10) {
        if (onCatch) {
          onCatch({
            playerId: `fielder_${index}`,
            position: ballPos.toArray(),
            type: distance < 1.0 ? 'catch' : 'field'
          });
        }
      }
    });
  };

  // Dedicated handler for shot movement WITHOUT physics interference
  const handleShotMovement = (ball, currentPos, currentVel, delta) => {
    if (!shotStartPosition) {
      setShotStartPosition(currentPos.clone());
    }
    
    const currentDistance = currentPos.distanceTo(shotStartPosition);
    const deterministicTarget = typeof window !== 'undefined' ? window.deterministicTarget : null;
    
    if (deterministicTarget) {
      const exactStopDistance = deterministicTarget.exactDistance;
      const stopPosition = new Vector3(...deterministicTarget.finalStopPosition);
      const progressToTarget = currentDistance / exactStopDistance;
      const distanceToStopPosition = currentPos.distanceTo(stopPosition);
      
      // Check if we've reached the target
      if (progressToTarget >= 0.99 || distanceToStopPosition <= 0.3) {
        // Place ball at exact stop position
        ball.position.copy(stopPosition);
        
        // Notify game state
        if (onBounce) {
          onBounce({
            type: 'position_update',
            position: stopPosition.toArray(),
            velocity: [0, 0, 0],
            isMoving: false
          });
        }
        
        // Add a configurable delay before resetting to bowler
        const resetDelay = (2.0) * 1000; // Convert to milliseconds
        
        if (onCatch) {
          setTimeout(() => {
            onCatch({
              type: 'collect',
              playerId: 'bowler',
              position: stopPosition.toArray(),
              reason: 'shot_distance_reached'
            });
          }, resetDelay);
        }
        
        // Clear deterministic target
        if (typeof window !== 'undefined') {
          window.deterministicTarget = null;
        }
        return;
      }
      
      // Move ball toward target WITHOUT physics
      const moveDirection = stopPosition.clone().sub(currentPos).normalize();
      
      // Calculate speed based on remaining distance (smooth deceleration)
      let moveSpeed = 20; // Base speed in m/s
      if (progressToTarget > 0.7) {
        // Smooth deceleration in final 30%
        const decelerationFactor = 1 - ((progressToTarget - 0.7) / 0.3);
        moveSpeed *= Math.max(0.1, decelerationFactor);
      }
      
      // Update position directly (no physics)
      const movement = moveDirection.multiplyScalar(moveSpeed * delta);
      currentPos.add(movement);
      
      // Handle bounce visually (keep Y at ground level with small bounce effect)
      if (currentPos.y <= GROUND_LEVEL) {
        currentPos.y = GROUND_LEVEL;
        // Add small visual bounce based on speed
        if (Math.random() < 0.1 && moveSpeed > 5) {
          currentPos.y += 0.05; // Small bounce effect
        }
      }
      
      // Update ball position
      ball.position.copy(currentPos);
      
      // Update trail
      setTrail(prev => {
        const newTrail = [...prev, currentPos.clone()];
        return newTrail.slice(-20);
      });
      
      // Check for boundary
      const boundaryDistance = Math.sqrt(currentPos.x ** 2 + currentPos.z ** 2);
      if (boundaryDistance > 50.0) {  // ✅ CORRECTED: Back to 50m boundary limit
        if (onReachTarget) {
          onReachTarget({
            target: 'boundary',
            position: currentPos.toArray(),
            boundaryDistance,
            runs: currentPos.y > 1 ? 6 : 4
          });
        }
        // Clear deterministic target
        if (typeof window !== 'undefined') {
          window.deterministicTarget = null;
        }
        return;
      }
      
      // Notify game state of position update
      if (onBounce) {
        onBounce({
          type: 'position_update',
          position: currentPos.toArray(),
          velocity: moveDirection.multiplyScalar(moveSpeed).toArray(),
          isMoving: true
        });
      }
      
    } else {
      // Fallback: Use simple distance-based movement
      const ballShotConfig = gameState.controls?.ballShot;
      const targetDistance = ballShotConfig?.distance || 15;
      
      if (currentDistance >= targetDistance) {
        // Add configurable delay before resetting in fallback case too
        const resetDelay = (gameState.controls?.ballShot?.resetDelay || 3.0) * 1000; // Convert to milliseconds
        
        if (onCatch) {
          setTimeout(() => {
            onCatch({
              type: 'collect',
              playerId: 'bowler',
              position: currentPos.toArray(),
              reason: 'target_distance_reached'
            });
          }, resetDelay);
        }
        return;
      }
      
      // Simple forward movement
      currentPos.add(currentVel.clone().multiplyScalar(delta));
      ball.position.copy(currentPos);
    }
  };

  const checkTargetReached = (ballPos, ballVel) => {
    if (!onReachTarget) return;

    // Check various target conditions
    
    // Ball reaching batsman (for bowling)
    if (ballState === 'bowling') {
      const strikerPos = new Vector3(0, 0, -9); // Striker position at wicket
      
      // Calculate distance primarily based on Z-axis (ignore Y and X for now as requested)
      const ballZ = ballPos.z;
      const strikerZ = strikerPos.z;
      const distanceZ = Math.abs(ballZ - strikerZ); // Z-axis distance only
      
      // Also calculate full 3D distance for reference
      const fullDistance = ballPos.distanceTo(strikerPos);
      
      // Trigger when ball is within 2 meters on Z-axis (approaching striker)
      if (distanceZ <= 2.0 && ballZ > strikerZ) { // Ball must be approaching from bowler's end
        onReachTarget({
          target: 'batsman',
          position: ballPos.toArray(),
          velocity: ballVel.toArray(),
          distance: distanceZ, // Pass Z-axis distance
          fullDistance // Pass full distance for reference
        });
      }
    }
    
    // Ball reaching boundary
    const boundaryDistance = Math.sqrt(ballPos.x ** 2 + ballPos.z ** 2);
    if (boundaryDistance > 50.0) { // ✅ CORRECTED: Actual playable boundary back to 50m
      onReachTarget({
        target: 'boundary',
        position: ballPos.toArray(),
        boundaryDistance,
        runs: ballPos.y > 1 ? 6 : 4
      });
      
      // Reset ball to bowler after boundary
      if (onCatch) {
        setTimeout(() => {
          onCatch({
            type: 'collect',
            playerId: 'bowler',
            position: ballPos.toArray(),
            reason: 'boundary_reached'
          });
        }, 2000); // 2 second delay to show boundary
      }
      return;
    }
    
    // Ball reaching wicket keeper (for shots) - USER CONTROLLED
    if (ballState === 'hit') {
      const keeperPos = new Vector3(0, 0, -11); // Wicket keeper position
      const distanceToKeeper = ballPos.distanceTo(keeperPos);
      const ballSpeed = ballVel.length();
      
      // Get user-defined keeper collection settings
      const ballShotConfig = gameState.controls?.ballShot;
      const keeperAutoCollect = ballShotConfig?.keeperAutoCollect ?? true; // ✅ DEFAULT TRUE - Normal cricket workflow
      const keeperCollectionRadius = ballShotConfig?.keeperCollectionRadius ?? 2.0;
      const keeperSpeedThreshold = ballShotConfig?.keeperSpeedThreshold ?? 3.0;
      
      // USER CONTROLLED: Only collect if auto-collect is enabled AND within user-defined limits
      if (keeperAutoCollect && distanceToKeeper < keeperCollectionRadius && ballSpeed < keeperSpeedThreshold) {
        if (onCatch) {
          onCatch({
            type: 'collect',
            playerId: 'wicket_keeper',
            position: ballPos.toArray(),
            reason: 'keeper_auto_collect'
          });
          // ✅ CricketGame.jsx now handles the return to bowler automatically
        }
        return;
      }
    }
  };

  // Render trajectory line and predicted path
  const renderTrajectory = () => {
    if (!showTrajectory) return null;

    // Enhanced predicted trajectory from pitch analysis
    const bounceData = currentBall.trajectory?.bounce;
    const targetData = currentBall.trajectory?.target;
    const predictedPoints = [];
    
    if (bounceData && bounceCount === 0) {
      // Add predicted path after bounce using enhanced trajectory data
      const steps = 20;
      const timeStep = 0.05;
      const pos = new Vector3(...bounceData.position);
      const vel = new Vector3(...bounceData.velocity);
      
      for (let i = 0; i < steps; i++) {
        predictedPoints.push([pos.x, pos.y, pos.z]);
        pos.add(vel.clone().multiplyScalar(timeStep));
        vel.y += GRAVITY * timeStep;
        
        // If we have target data, guide trajectory toward it for accuracy
        if (targetData && i > steps / 2) {
          const targetPos = new Vector3(...targetData.position);
          const direction = targetPos.clone().sub(pos).normalize();
          vel.add(direction.multiplyScalar(0.1)); // Slight course correction
        }
      }
    }
    
    return (
      <group>
        {/* Actual trail - using connected spheres instead of lines */}
        {trail.length >= 2 && (
          <group>
            {trail.map((pos, index) => (
              <mesh key={index} position={[pos.x, pos.y, pos.z]}>
                <sphereGeometry args={[0.02, 4, 4]} />
                <meshBasicMaterial color="#ff4444" opacity={0.6} transparent />
              </mesh>
            ))}
          </group>
        )}
        
        {/* Predicted path - using connected spheres */}
        {predictedPoints.length > 0 && (
          <group>
            {predictedPoints.map((point, index) => (
              <mesh key={index} position={point}>
                <sphereGeometry args={[0.015, 4, 4]} />
                <meshBasicMaterial color="#44ff44" opacity={0.4} transparent />
              </mesh>
            ))}
          </group>
        )}
      </group>
    );
  };

  return (
    <group>
      {/* Clean cricket ball - single version */}
      
      {/* Clean cricket ball - enlarged for better visibility */}
      <mesh 
        ref={ballRef} 
        position={Array.isArray(position) ? position : [position?.x || 0, position?.y || 0, position?.z || 0]} 
        castShadow 
        receiveShadow
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#CC0000" 
          metalness={0.1}
          roughness={0.8}
        />
        
        {/* Ball seam - proportionally larger */}
        <mesh>
          <torusGeometry args={[0.08, 0.004, 4, 24]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </mesh>

      {/* Position marker removed for clean visual */}

      {/* Ball trajectory trail - only when explicitly shown */}
      {showTrajectory && renderTrajectory()}
      
      {/* Visual effects removed for clean scene */}
    </group>
  );
};

export default EnhancedBall;