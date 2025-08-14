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

  // Physics constants (reduced gravity for better ball reach)
  const GRAVITY = -4.5; // Reduced gravity so ball travels further
  const AIR_RESISTANCE = 0.99; // Less air resistance
  const BOUNCE_DAMPING = 0.7;
  const GROUND_LEVEL = 0.05;

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
        currentVel.y = Math.abs(currentVel.y) * BOUNCE_DAMPING;
        currentVel.x *= 0.9; // Friction
        currentVel.z *= 0.9; // Friction
        
        setBounceCount(prev => prev + 1);
        
        // Trigger bounce callback
        if (onBounce) {
          onBounce({
            position: currentPos.toArray(),
            velocity: currentVel.toArray(),
            bounceCount: bounceCount + 1
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
      
      // Rotate ball based on movement
      const speed = currentVel && currentVel.length ? currentVel.length() : Math.sqrt(currentVel.x**2 + currentVel.y**2 + currentVel.z**2);
      ball.rotation.x += speed * delta * 2;
      ball.rotation.z += speed * delta * 1.5;

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

  // Render trajectory line
  const renderTrajectory = () => {
    if (!showTrajectory || trail.length < 2) return null;

    const points = trail.map(pos => [pos.x, pos.y, pos.z]);
    
    return (
      <line ref={trajectoryRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flat())}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff4444" opacity={0.6} transparent />
      </line>
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