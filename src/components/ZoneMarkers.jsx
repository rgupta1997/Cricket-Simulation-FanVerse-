/* eslint-disable react/no-unknown-property */
import React from 'react';

const ZoneMarkers = ({ 
  visible = true, 
  strikerPosition = [0, 0, -9], 
  currentDistance = 15,
  currentAngle = 0 
}) => {
  if (!visible) return null;

  const [strikerX, , strikerZ] = strikerPosition;

  // Define distance zones with colors and names
  const zones = [
    { distance: 5, color: '#00ff00', name: 'Close', opacity: 0.3 },
    { distance: 10, color: '#ffff00', name: 'Inner', opacity: 0.3 },
    { distance: 15, color: '#ff8000', name: 'Deep', opacity: 0.3 },
    { distance: 20, color: '#ff4000', name: 'Approach', opacity: 0.3 },
    { distance: 25, color: '#ff0000', name: 'Near Boundary', opacity: 0.3 },
    { distance: 30, color: '#800080', name: 'Boundary+', opacity: 0.3 }
  ];

  // Boundary distances for different angles (using actual playable boundary)
  const calculateBoundaryDistance = (angleDegrees) => {
    const PLAYABLE_BOUNDARY_RADIUS = 25.5;
    const STRIKER_POS = [0, 0, -9];
    
    const angleRad = (angleDegrees * Math.PI) / 180;
    const dirX = Math.cos(angleRad);
    const dirZ = -Math.sin(angleRad);
    
    const strikerX = STRIKER_POS[0];
    const strikerZ = STRIKER_POS[2];
    
    const a = dirX * dirX + dirZ * dirZ;
    const b = 2 * (strikerX * dirX + strikerZ * dirZ);
    const c = strikerX * strikerX + strikerZ * strikerZ - PLAYABLE_BOUNDARY_RADIUS * PLAYABLE_BOUNDARY_RADIUS;
    
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return 25;
    
    const t = (-b + Math.sqrt(discriminant)) / (2 * a);
    return Math.sqrt((t * dirX) ** 2 + (t * dirZ) ** 2);
  };

  // Create zone circles
  const zoneCircles = zones.map((zone, index) => (
    <mesh 
      key={`zone-${index}`} 
      position={[strikerX, 0.05, strikerZ]} 
      rotation={[-Math.PI/2, 0, 0]}
    >
      <torusGeometry args={[zone.distance, 0.2, 8, 32]} />
      <meshBasicMaterial 
        color={zone.color} 
        transparent 
        opacity={zone.opacity}
      />
    </mesh>
  ));

  // Create zone labels
  const zoneLabels = zones.map((zone, index) => {
    if (zone.distance > 35) return null; // Don't show labels for very far zones
    
    return (
      <group key={`label-${index}`} position={[strikerX + zone.distance, 0.5, strikerZ]}>
        <mesh>
          <boxGeometry args={[3, 0.8, 0.1]} />
          <meshBasicMaterial color={zone.color} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[2.8, 0.6, 0.05]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Zone text would go here - simplified for now */}
      </group>
    );
  });

  // Create current shot indicator
  const currentShotMarker = () => {
    const angleRad = (currentAngle * Math.PI) / 180;
    const x = Math.cos(angleRad) * currentDistance;
    const z = -Math.sin(angleRad) * currentDistance;
    
    const finalX = strikerX + x;
    const finalZ = strikerZ + z;

    return (
      <group position={[finalX, 0.3, finalZ]}>
        {/* Target marker */}
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} />
        </mesh>
        {/* Target ring */}
        <mesh rotation={[-Math.PI/2, 0, 0]}>
          <torusGeometry args={[1, 0.1, 8, 16]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
        </mesh>
        {/* Target pole for visibility */}
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
        </mesh>
      </group>
    );
  };

  // Create direction line from striker to target
  const directionLine = () => {
    const angleRad = (currentAngle * Math.PI) / 180;
    const lineLength = Math.min(currentDistance, 35); // Cap line length for visibility
    
    const midX = strikerX + Math.cos(angleRad) * (lineLength / 2);
    const midZ = strikerZ + (-Math.sin(angleRad)) * (lineLength / 2);
    
    return (
      <mesh 
        position={[midX, 0.1, midZ]} 
        rotation={[0, -angleRad, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, lineLength, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    );
  };

  // Create distance grid (radial lines every 45 degrees)
  const gridLines = [];
  for (let angle = 0; angle < 360; angle += 45) {
    const angleRad = (angle * Math.PI) / 180;
    const maxDistance = Math.min(calculateBoundaryDistance(angle), 35);
    
    const midX = strikerX + Math.cos(angleRad) * (maxDistance / 2);
    const midZ = strikerZ + (-Math.sin(angleRad)) * (maxDistance / 2);
    
    gridLines.push(
      <mesh 
        key={`grid-${angle}`}
        position={[midX, 0.05, midZ]} 
        rotation={[0, -angleRad, 0]}
      >
        <cylinderGeometry args={[0.02, 0.02, maxDistance, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
    );
  }

  return (
    <group name="zone-markers">
      {/* Zone circles */}
      {zoneCircles}
      
      {/* Zone labels */}
      {zoneLabels}
      
      {/* Direction grid */}
      {gridLines}
      
      {/* Direction line to target */}
      {directionLine()}
      
      {/* Current shot marker */}
      {currentShotMarker()}
      
      {/* Striker position marker */}
      <mesh position={[strikerX, 0.4, strikerZ]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Distance scale markers */}
      {[5, 10, 15, 20, 25, 30].map(distance => (
        <group key={`scale-${distance}`} position={[strikerX + distance, 0.2, strikerZ]}>
          <mesh>
            <boxGeometry args={[0.5, 1, 0.1]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[2, 0.4, 0.05]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default ZoneMarkers;
