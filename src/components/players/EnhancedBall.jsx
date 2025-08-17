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
  
  const { currentBall, ballState } = gameState;
  const { position, velocity, isMoving } = currentBall;

  // Physics constants for cricket ball
  const GRAVITY = -9.81; // Real world gravity
  const AIR_RESISTANCE = 0.995; // Slight air resistance
  const BOUNCE_DAMPING = 0.6; // 60% energy retention on bounce
  const GROUND_LEVEL = 0.07; // Ball radius
  const SPIN_FACTOR = 2.5; // Ball spin multiplier

  useFrame((state, delta) => {
    if (!ballRef.current) return;
    
    const ball = ballRef.current;
    
    // Always update ball position from game state
    if (position) {
      const pos = Array.isArray(position) ? position : [position.x || 0, position.y || 0.5, position.z || 0];
      ball.position.set(...pos);
    }
    
    // Debug logging with distance to striker
    if (isMoving && Math.random() < 0.05) { // Reduced frequency
      const strikerPos = new Vector3(0, 0, -9); // Striker centered at stumps
      const ballPos = new Vector3(...(Array.isArray(position) ? position : [position.x || 0, position.y || 0.5, position.z || 0]));
      const distanceToStriker = ballPos.distanceTo(strikerPos);
      console.log('🏃 Ball Physics - Pos:', position, 'Distance to striker:', distanceToStriker.toFixed(2), 'State:', ballState);
    }
    
    if (!isMoving || !velocity) return;

    const currentPos = new Vector3(...(Array.isArray(position) ? position : [position.x || 0, position.y || 0.5, position.z || 0]));
    const currentVel = new Vector3(...(Array.isArray(velocity) ? velocity : [velocity.x || 0, velocity.y || 0, velocity.z || 0]));

    // Apply physics for all moving states
    if (isMoving && (ballState === 'bowling' || ballState === 'hit' || ballState === 'returning')) {
      // Apply gravity
      currentVel.y += GRAVITY * delta;
      
      // Apply air resistance
      currentVel.multiplyScalar(AIR_RESISTANCE);
      
      // Update position
      currentPos.add(currentVel.clone().multiplyScalar(delta));
      
      // Ground collision detection
      if (currentPos.y <= GROUND_LEVEL && currentVel.y < 0) {
        currentPos.y = GROUND_LEVEL;
        
        // Get bounce parameters from game state
        const bounceHeight = currentBall.bounceHeight || 0.5;
        const bounceData = currentBall.trajectory?.bounce;
        
        if (bounceData && bounceCount === 0) {
          // First bounce - use pre-calculated bounce velocity
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
            bounceHeight: bounceHeight
          });
        }
      }

      // Update ball position
      ball.position.copy(currentPos);
      
      // Update game state with new position and velocity
      if (onBounce) {
        onBounce({
          type: 'position_update',
          position: currentPos.toArray(),
          velocity: currentVel.toArray(),
          isMoving: currentVel.length() > 0.1
        });
      }
      
      // Check for batsman interaction when ball is near
      const batsmanPos = new Vector3(0, 0, -9); // Striker in front of stumps
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
      
      // Enhanced ball rotation with spin effects
      const speed = currentVel.length();
      const horizontalSpeed = Math.sqrt(currentVel.x**2 + currentVel.z**2);
      
      // Add spin based on velocity components
      ball.rotation.x += horizontalSpeed * delta * SPIN_FACTOR; // Forward rotation
      ball.rotation.y += currentVel.x * delta * SPIN_FACTOR * 0.5; // Side spin
      ball.rotation.z += currentVel.z * delta * SPIN_FACTOR * 0.3; // Drift spin

      // Update trail
      setTrail(prev => {
        const newTrail = [...prev, currentPos.clone()];
        return newTrail.slice(-20); // Keep last 20 positions
      });

      // Check if ball has stopped moving (auto-reset to keeper)
      if (currentVel.length() < 0.1 && currentPos.y <= GROUND_LEVEL + 0.1) {
        console.log('🔄 Ball stopped moving at:', currentPos.toArray(), 'returning to keeper automatically');
        if (onCatch) {
          onCatch({
            type: 'collect',
            playerId: 'wicket_keeper',
            position: currentPos.toArray()
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
    const { players } = gameState;
    
    // Ball reaching batsman (for bowling)
    if (ballState === 'bowling') {
      const batsmanPos = new Vector3(0, 0, -9); // Striker position
      const distance = ballPos.distanceTo(batsmanPos);
      
      console.log('🎯 Ball distance to striker:', distance.toFixed(2), 'Ball pos:', ballPos.toArray());
      
      if (distance < 4.0) { // Increased detection radius
        console.log('⚾ Ball in batting range! Distance:', distance);
        onReachTarget({
          target: 'batsman',
          position: ballPos.toArray(),
          velocity: ballVel.toArray(),
          distance: distance
        });
      }
    }
    
    // Ball reaching boundary
    const boundaryDistance = Math.sqrt(ballPos.x ** 2 + ballPos.z ** 2);
    if (boundaryDistance > 25) {
      onReachTarget({
        target: 'boundary',
        position: ballPos.toArray(),
        runs: ballPos.y > 1 ? 6 : 4
      });
    }
  };

  // Render trajectory line and predicted path
  const renderTrajectory = () => {
    if (!showTrajectory) return null;

    // Actual trail
    const trailPoints = trail.map(pos => [pos.x, pos.y, pos.z]);
    
    // Predicted trajectory from bounce data
    const bounceData = currentBall.trajectory?.bounce;
    const predictedPoints = [];
    
    if (bounceData && bounceCount === 0) {
      // Add predicted path after bounce
      const steps = 20;
      const timeStep = 0.05;
      let pos = new Vector3(...bounceData.position);
      let vel = new Vector3(...bounceData.velocity);
      
      for (let i = 0; i < steps; i++) {
        predictedPoints.push([pos.x, pos.y, pos.z]);
        pos.add(vel.clone().multiplyScalar(timeStep));
        vel.y += GRAVITY * timeStep;
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