/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

const EnhancedBall = ({ 
  gameState, 
  onBounce, 
  onCatch, 
  onReachTarget,
  showTrajectory = false 
}) => {
  const ballRef = useRef();
  const trajectoryRef = useRef();
  const [trail, setTrail] = useState([]);
  const [bounceCount, setBounceCount] = useState(0);
  const [shotStartPosition, setShotStartPosition] = useState(null); // Track where shot started
  const [distanceTraveled, setDistanceTraveled] = useState(0); // Track distance from shot start
  
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
        setDistanceTraveled(0);
        console.log('🏏 Shot started from position:', position);
      }
      
      console.log('🎯 Starting direct coordinate trajectory mode');
    } else if (!isMoving) {
      // Ball stopped - reset trajectory state completely
      setTrajectoryStartTime(null);
      setPhysicsMode(false);
      setCurrentWaypoint(0);
      setTrajectoryProgress(0);
      setBounceCount(0);
      setShotStartPosition(null);
      setDistanceTraveled(0);
      console.log('🔄 Ball stopped - resetting trajectory state');
    }
  }, [isMoving, trajectoryStartTime, ballState, position]);

  useFrame((state, delta) => {
    if (!ballRef.current || !isMoving) return;
    
    const ball = ballRef.current;
    const trajectory = currentBall.trajectory;
    const useDirectCoordinates = trajectory?.metadata?.useDirectCoordinates;
    
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
            console.log(`🎯 Reached waypoint ${currentWaypoint + 1}:`, endPoint.toArray());
            
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
              console.log('🎯 Reached final coordinate, stopping ball (direct coordinate mode)');
              
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
        
        // Log progress occasionally  
        if (Math.random() < 0.1) {
          console.log(`🎯 Direct coordinate movement - Waypoint: ${currentWaypoint}, Progress: ${(trajectoryProgress * 100).toFixed(1)}%, Pos:`, currentPos.toArray());
        }
        
        return; // Skip physics when in direct coordinate mode
      }
    }
    
    // PHYSICS MODE or NON-DIRECT COORDINATE MODE
    if (!position || !velocity) return;

    const currentPos = new Vector3(...(Array.isArray(position) ? position : [position.x || 0, position.y || 0.5, position.z || 0]));
    const currentVel = new Vector3(...(Array.isArray(velocity) ? velocity : [velocity.x || 0, velocity.y || 0, velocity.z || 0]));
    
    // Apply physics only in physics mode or for non-direct coordinates
    if (physicsMode || !useDirectCoordinates) {
      console.log('⚙️ Physics mode active');
      ball.position.copy(currentPos);
    }

    // Apply physics for all moving states (only when physics mode is enabled)
    if (isMoving && (ballState === 'bowling' || ballState === 'hit' || ballState === 'returning') && (physicsMode || !useDirectCoordinates)) {
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
        const pitchAnalysis = currentBall.pitchAnalysis;
        
        if (bounceData && bounceCount === 0) {
          // First bounce - use pre-calculated bounce velocity from pitch analysis
          currentVel.set(
            bounceData.velocity[0],
            bounceData.velocity[1],
            bounceData.velocity[2]
          );
          
          // Log enhanced bounce details
          if (pitchAnalysis) {
            console.log('🎯 Enhanced bounce at:', currentPos.toArray(), 
              'Analysis data:', pitchAnalysis,
              'Target:', bounceData.position);
          }
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
            bounceHeight: bounceHeight
          });
        }
      }

      // Update ball position
      ball.position.copy(currentPos);
      
      // Track distance traveled for shots
      if (ballState === 'hit' && shotStartPosition) {
        const currentDistance = currentPos.distanceTo(shotStartPosition);
        setDistanceTraveled(currentDistance);
        
        // Get ball shot configuration to check max distance
        const ballShotConfig = gameState.controls?.ballShot;
        const maxDistance = ballShotConfig?.distance || 30; // Default 30 meters if not set
        
        console.log('📏 Shot distance traveled:', currentDistance.toFixed(2), 'Max:', maxDistance);
        
        // Check reset conditions for shots
        if (currentDistance >= maxDistance) {
          console.log('🎯 Ball reached maximum distance:', maxDistance, 'm - resetting to bowler');
          if (onCatch) {
            onCatch({
              type: 'collect',
              playerId: 'bowler',
              position: currentPos.toArray(),
              reason: 'max_distance_reached'
            });
          }
          return;
        }
      }
      
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
      const speed = currentVel.length();
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

      // Check if ball has stopped moving (auto-reset to keeper)
      if (currentVel.length() < 0.1 && currentPos.y <= GROUND_LEVEL + 0.1) {
        console.log('🔄 Ball stopped moving at:', currentPos.toArray(), 'velocity:', currentVel.length(), 'returning to keeper automatically');
        console.log('🔄 Ball state before reset:', ballState, 'Game will be reset to WAITING_FOR_BALL');
        if (onCatch) {
          onCatch({
            type: 'collect',
            playerId: 'wicket_keeper',
            position: currentPos.toArray(),
            reason: 'ball_stopped'
          });
        }
        return; // Stop further processing
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
    
    // Check wicket keeper
    if (ballState === 'returning') {
      const keeperPos = new Vector3(...keeper.position);
      const distance = ballPos.distanceTo(keeperPos);
      
      if (distance < 1.0 && ballSpeed < 5) {
        if (onCatch) {
          onCatch({
            playerId: 'wicket_keeper',
            position: ballPos.toArray(),
            type: 'collect'
          });
        }
      }
    }

    // Check fielders
    fielders.forEach((fielder, index) => {
      const fielderPos = new Vector3(...fielder.position);
      const distance = ballPos.distanceTo(fielderPos);
      
      if (distance < 2.0 && ballSpeed < 10) {
        console.log('🟢 Ball fielded by fielder', index, 'at distance', distance);
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
      
      console.log('🎯 Ball Z-axis distance to striker:', distanceZ.toFixed(2), 'Full distance:', fullDistance.toFixed(2), 'Ball Z:', ballZ.toFixed(2), 'Striker Z:', strikerZ);
      
      // Trigger when ball is within 2 meters on Z-axis (approaching striker)
      if (distanceZ <= 2.0 && ballZ > strikerZ) { // Ball must be approaching from bowler's end
        console.log('⚾ Ball in batting range! Z-distance:', distanceZ.toFixed(2));
        onReachTarget({
          target: 'batsman',
          position: ballPos.toArray(),
          velocity: ballVel.toArray(),
          distance: distanceZ, // Pass Z-axis distance
          fullDistance: fullDistance // Pass full distance for reference
        });
      }
    }
    
    // Ball reaching boundary
    const boundaryDistance = Math.sqrt(ballPos.x ** 2 + ballPos.z ** 2);
    if (boundaryDistance > 25) {
      console.log('🏟️ Ball reached boundary - resetting to bowler');
      onReachTarget({
        target: 'boundary',
        position: ballPos.toArray(),
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
    
    // Ball reaching wicket keeper (for shots)
    if (ballState === 'hit') {
      const keeperPos = new Vector3(0, 0, -11); // Wicket keeper position
      const distanceToKeeper = ballPos.distanceTo(keeperPos);
      
      if (distanceToKeeper < 2.0) {
        console.log('🧤 Ball reached wicket keeper - resetting to bowler');
        if (onCatch) {
          onCatch({
            type: 'collect',
            playerId: 'wicket_keeper',
            position: ballPos.toArray(),
            reason: 'keeper_collected'
          });
          
          // Then reset to bowler
          setTimeout(() => {
            onCatch({
              type: 'collect',
              playerId: 'bowler',
              position: [0, 0.5, 15], // Bowler position
              reason: 'reset_to_bowler'
            });
          }, 1000);
        }
        return;
      }
    }
  };

  // Render trajectory line and predicted path
  const renderTrajectory = () => {
    if (!showTrajectory) return null;

    // Actual trail
    const trailPoints = trail.map(pos => [pos.x, pos.y, pos.z]);
    
    // Enhanced predicted trajectory from pitch analysis
    const bounceData = currentBall.trajectory?.bounce;
    const targetData = currentBall.trajectory?.target;
    const pitchAnalysis = currentBall.pitchAnalysis;
    const predictedPoints = [];
    
    if (bounceData && bounceCount === 0) {
      // Add predicted path after bounce using enhanced trajectory data
      const steps = 20;
      const timeStep = 0.05;
      let pos = new Vector3(...bounceData.position);
      let vel = new Vector3(...bounceData.velocity);
      
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
        {/* Actual trail */}
        {trail.length >= 2 && (
          <line ref={trajectoryRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={trailPoints.length}
                array={new Float32Array(trailPoints.flat())}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ff4444" opacity={0.6} transparent />
          </line>
        )}
        
        {/* Predicted path */}
        {predictedPoints.length > 0 && (
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={predictedPoints.length}
                array={new Float32Array(predictedPoints.flat())}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#44ff44" opacity={0.4} transparent dashSize={0.2} gapSize={0.1} />
          </line>
        )}
      </group>
    );
  };

  return (
    <group>
      {/* Always visible ball - simple version */}
      <mesh 
        position={Array.isArray(position) ? position : [position?.x || 0, position?.y || 0.5, position?.z || 0]} 
        castShadow 
        receiveShadow
      >
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={isMoving ? "#8B4513" : "#654321"} />
      </mesh>
      
      {/* Main ball */}
      <mesh 
        ref={ballRef} 
        position={Array.isArray(position) ? position : [position?.x || 0, position?.y || 0, position?.z || 0]} 
        castShadow 
        receiveShadow
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhongMaterial 
          color={isMoving ? "#8B2500" : "#654321"} 
          shininess={80}
          emissive={isMoving ? "#331100" : "#000000"}
        />
        
        {/* Ball seam - larger and more visible */}
        <mesh>
          <torusGeometry args={[0.15, 0.01, 4, 24]} />
          <meshBasicMaterial color="#F5F5DC" />
        </mesh>
        
        {/* Shine effect for moving ball */}
        {isMoving && (
          <mesh>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial 
              color="#AA6644" 
              transparent 
              opacity={0.3}
              blending={2} // AdditiveBlending
            />
          </mesh>
        )}
      </mesh>

      {/* Ball trajectory trail */}
      {renderTrajectory()}
      
      {/* Impact particles effect */}
      {bounceCount > 0 && position && (
        <group position={Array.isArray(position) ? position : [position?.x || 0, position?.y || 0, position?.z || 0]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 0.5,
              Math.random() * 0.2,
              (Math.random() - 0.5) * 0.5
            ]}>
              <sphereGeometry args={[0.01, 4, 4]} />
              <meshBasicMaterial 
                color="#8B4513" 
                transparent 
                opacity={0.6 - (bounceCount * 0.1)}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Speed indicator */}
      {isMoving && velocity && position && (
        <mesh position={[
          Array.isArray(position) ? position[0] : (position.x || 0), 
          (Array.isArray(position) ? position[1] : (position.y || 0)) + 0.2, 
          Array.isArray(position) ? position[2] : (position.z || 0)
        ]}>
          <boxGeometry args={[0.1, 0.02, 0.02]} />
          <meshBasicMaterial 
            color={`hsl(${Math.max(0, 120 - Math.sqrt(
              (Array.isArray(velocity) ? velocity[0] : (velocity.x || 0))**2 + 
              (Array.isArray(velocity) ? velocity[1] : (velocity.y || 0))**2 + 
              (Array.isArray(velocity) ? velocity[2] : (velocity.z || 0))**2
            ) * 10)}, 100%, 50%)`}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
};

export default EnhancedBall;