import React from 'react';
import { calculateBallTrajectory } from './CricketGameState';

const PitchMarkers = ({ bowlingControls, showCoordinates = true, showGrid = true }) => {
  // Calculate current trajectory
  const trajectory = calculateBallTrajectory(bowlingControls);
  
  const releasePos = trajectory.initial.position;
  const bouncePos = trajectory.bounce.position;
  const finalPos = trajectory.target.position;

  return (
    <group>
      {/* Release Position Marker */}
      <group position={releasePos}>
        {/* Release marker - Blue sphere */}
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#0066FF" transparent opacity={0.8} />
        </mesh>
        {/* Release pole */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshBasicMaterial color="#0066FF" transparent opacity={0.6} />
        </mesh>
        {/* Release label */}
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[2, 0.5, 0.1]} />
          <meshBasicMaterial color="#0066FF" />
        </mesh>
        {showCoordinates && (
          <mesh position={[0, 3, 0]}>
            <boxGeometry args={[4, 0.8, 0.1]} />
            <meshBasicMaterial color="#000066" />
          </mesh>
        )}
      </group>

      {/* Bounce Position Marker */}
      <group position={bouncePos}>
        {/* Bounce marker - Red sphere */}
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#FF4444" transparent opacity={0.8} />
        </mesh>
        {/* Bounce impact ring */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[0.3, 0.8, 16]} />
          <meshBasicMaterial color="#FF4444" transparent opacity={0.4} />
        </mesh>
        {/* Bounce pole */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
          <meshBasicMaterial color="#FF4444" transparent opacity={0.6} />
        </mesh>
        {/* Bounce label */}
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[2, 0.5, 0.1]} />
          <meshBasicMaterial color="#FF4444" />
        </mesh>
        {showCoordinates && (
          <mesh position={[0, 2.3, 0]}>
            <boxGeometry args={[4, 0.8, 0.1]} />
            <meshBasicMaterial color="#660000" />
          </mesh>
        )}
      </group>

      {/* Final Position Marker */}
      <group position={finalPos}>
        {/* Final marker - Green sphere */}
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#44FF44" transparent opacity={0.8} />
        </mesh>
        {/* Final target zone */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[0.2, 0.6, 16]} />
          <meshBasicMaterial color="#44FF44" transparent opacity={0.3} />
        </mesh>
        {/* Final pole */}
        <mesh position={[0, finalPos[1] / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, finalPos[1], 8]} />
          <meshBasicMaterial color="#44FF44" transparent opacity={0.6} />
        </mesh>
        {/* Final label */}
        <mesh position={[0, finalPos[1] + 0.5, 0]}>
          <boxGeometry args={[2, 0.5, 0.1]} />
          <meshBasicMaterial color="#44FF44" />
        </mesh>
        {showCoordinates && (
          <mesh position={[0, finalPos[1] + 1, 0]}>
            <boxGeometry args={[4, 0.8, 0.1]} />
            <meshBasicMaterial color="#004400" />
          </mesh>
        )}
      </group>

      {/* Trajectory Line */}
      <group>
        {/* Release to Bounce line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                ...releasePos,
                ...bouncePos
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#FFAA00" linewidth={3} />
        </line>
        
        {/* Bounce to Final line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                ...bouncePos,
                ...finalPos
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#FFAA00" linewidth={3} dashSize={0.2} gapSize={0.1} />
        </line>
      </group>

      {/* Pitch Grid Overlay */}
      {showGrid && (
        <group>
          {/* Length lines (parallel to pitch) */}
          {[-10, -5, 0, 5, 10].map(z => (
            <line key={`length-${z}`}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    -2, 0.01, z,
                    2, 0.01, z
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
            </line>
          ))}
          
          {/* Width lines (across pitch) */}
          {[-1.5, -0.75, 0, 0.75, 1.5].map(x => (
            <line key={`width-${x}`}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    x, 0.01, -11,
                    x, 0.01, 11
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#FFFFFF" transparent opacity={0.2} />
            </line>
          ))}
          
          {/* Center line */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  0, 0.01, -11,
                  0, 0.01, 11
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#FFFF00" transparent opacity={0.5} />
          </line>
          
          {/* Coordinate markers every 5 meters */}
          {[-10, -5, 0, 5, 10].map(z => (
            <mesh key={`coord-${z}`} position={[2.5, 0.02, z]}>
              <boxGeometry args={[1, 0.1, 0.5]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

export default PitchMarkers;
