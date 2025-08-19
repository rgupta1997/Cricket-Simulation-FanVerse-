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
        {/* Release to Bounce line - using cylinder to avoid line material issues */}
        <mesh 
          position={[
            (releasePos[0] + bouncePos[0]) / 2,
            (releasePos[1] + bouncePos[1]) / 2,
            (releasePos[2] + bouncePos[2]) / 2
          ]}
          rotation={[
            0,
            0,
            Math.atan2(bouncePos[0] - releasePos[0], bouncePos[2] - releasePos[2])
          ]}
        >
          <cylinderGeometry args={[
            0.02, 
            0.02, 
            Math.sqrt(
              Math.pow(bouncePos[0] - releasePos[0], 2) + 
              Math.pow(bouncePos[1] - releasePos[1], 2) + 
              Math.pow(bouncePos[2] - releasePos[2], 2)
            ), 
            8
          ]} />
          <meshBasicMaterial color="#FFAA00" transparent opacity={0.6} />
        </mesh>
        
        {/* Bounce to Final line - using cylinder */}
        <mesh 
          position={[
            (bouncePos[0] + finalPos[0]) / 2,
            (bouncePos[1] + finalPos[1]) / 2,
            (bouncePos[2] + finalPos[2]) / 2
          ]}
          rotation={[
            0,
            0,
            Math.atan2(finalPos[0] - bouncePos[0], finalPos[2] - bouncePos[2])
          ]}
        >
          <cylinderGeometry args={[
            0.015, 
            0.015, 
            Math.sqrt(
              Math.pow(finalPos[0] - bouncePos[0], 2) + 
              Math.pow(finalPos[1] - bouncePos[1], 2) + 
              Math.pow(finalPos[2] - bouncePos[2], 2)
            ), 
            8
          ]} />
          <meshBasicMaterial color="#FFAA00" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Pitch Grid Overlay */}
      {showGrid && (
        <group>
          {/* Length lines (parallel to pitch) - using thin cylinders instead of lines */}
          {[-10, -5, 0, 5, 10].map(z => (
            <mesh key={`length-${z}`} position={[0, 0.01, z]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.005, 0.005, 4, 6]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
            </mesh>
          ))}
          
          {/* Width lines (across pitch) - using thin cylinders */}
          {[-1.5, -0.75, 0, 0.75, 1.5].map(x => (
            <mesh key={`width-${x}`} position={[x, 0.01, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 22, 6]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.2} />
            </mesh>
          ))}
          
          {/* Center line - using cylinder */}
          <mesh position={[0, 0.01, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 22, 8]} />
            <meshBasicMaterial color="#FFFF00" transparent opacity={0.5} />
          </mesh>
          
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
