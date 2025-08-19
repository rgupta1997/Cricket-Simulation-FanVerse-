import React from 'react';
import { Html } from '@react-three/drei';

const BallPositionMarker = ({ position, velocity, isMoving, showCoordinates = true }) => {
  // Safety checks to prevent rendering with invalid data
  if (!position || !Array.isArray(position) || position.length !== 3) return null;
  if (!velocity || !Array.isArray(velocity) || velocity.length !== 3) return null;
  
  const [x, y, z] = position;
  const [vx, vy, vz] = velocity;
  
  // Additional safety checks for valid numbers
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  if (!Number.isFinite(vx) || !Number.isFinite(vy) || !Number.isFinite(vz)) return null;
  
  const ballSpeed = Math.sqrt(vx*vx + vy*vy + vz*vz);
  
  return (
    <group position={[x, y + 0.8, z]}>
      {/* Marker pole extending upward from ball */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshBasicMaterial color={isMoving ? "#FF6600" : "#666666"} transparent opacity={0.7} />
      </mesh>
      
      {/* Info board background */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[3.5, 1.2, 0.1]} />
        <meshBasicMaterial color={isMoving ? "#FF6600" : "#333333"} transparent opacity={0.9} />
      </mesh>
      
      {/* Ball position text using HTML overlay */}
      {showCoordinates && (
        <Html position={[0, 1.2, 0.06]} center>
          <div style={{
            background: isMoving ? 'rgba(255,102,0,0.9)' : 'rgba(51,51,51,0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            textAlign: 'center',
            border: '2px solid ' + (isMoving ? '#FF6600' : '#666666'),
            minWidth: '120px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#FFD700' }}>
              BALL POSITION
            </div>
            <div style={{ color: '#FFD700' }}>X: {x.toFixed(2)}m</div>
            <div style={{ color: '#FFD700' }}>Y: {y.toFixed(2)}m</div>
            <div style={{ color: '#FFD700' }}>Z: {z.toFixed(2)}m</div>
            {isMoving && (
              <div style={{ color: '#00FF00', fontSize: '11px', marginTop: '4px' }}>
                Speed: {ballSpeed.toFixed(1)} m/s
              </div>
            )}
          </div>
        </Html>
      )}
      
      {/* Status indicator sphere */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial 
          color={isMoving ? "#00FF00" : "#FF0000"} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Connecting line from ball to marker - using cylinder instead of line to avoid material issues */}
      <mesh position={[0, -0.4, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.8, 6]} />
        <meshBasicMaterial 
          color={isMoving ? "#FF6600" : "#666666"} 
          transparent 
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};

export default BallPositionMarker;
