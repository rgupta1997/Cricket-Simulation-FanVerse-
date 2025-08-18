/* eslint-disable react/no-unknown-property */
import { Text } from '@react-three/drei';

// Helper function to get cricket position name - EXACT WAGON WHEEL MAPPING
const getPositionName = (degree) => {
  switch (degree) {
    case 0: return 'Square Leg';
    case 45: return 'Fine Leg';
    case 90: return 'Third Man';
    case 135: return 'Point';
    case 180: return 'Cover';
    case 225: return 'Long Off';
    case 270: return 'Long On';
    case 315: return 'Mid Wicket';
    default: return '';
  }
};

// Pure component for wagon wheel overlay with 8 sections centered at striker position
const WagonWheel = ({ radius = 28, visible = true, strikerPosition = [0, 0, -9] }) => {
  console.log('🎯 WagonWheel rendering:', { radius, visible, strikerPosition });
  
  if (!visible) return null;

  const lines = [];
  const degreeMarkers = [];
  const sectionLabels = [];

  // Striker position
  const [strikerX, , strikerZ] = strikerPosition; // strikerY not used, so destructure as blank

  // Create concentric circles for distance reference (centered at striker)
  const circles = [];
  const circleRadii = [10, 15, 20, 25]; // Different distance markers
  
  circleRadii.forEach((circRadius, index) => {
    circles.push(
      <mesh key={`circle-${index}`} position={[strikerX, 0.1, strikerZ]} rotation={[-Math.PI/2, 0, 0]}>
        <torusGeometry args={[circRadius, 0.1, 8, 32]} />
        <meshBasicMaterial 
          color="#00aaff" 
          transparent 
          opacity={0.6}
        />
      </mesh>
    );
  }); // Striker-centered concentric circles for distance markers

  // Create 8 radial lines (every 45 degrees) from striker to boundary
  // Starting from square leg at 0° and moving anti-clockwise, rotated 90° clockwise from bowler
  for (let i = 0; i < 8; i++) {
    // Convert cricket field degrees to 3D coordinates
    // Rotate the entire wheel 90° clockwise: subtract 90° from the base angle
    const cricketDegree = i * 45; // 0°, 45°, 90°, etc.
    const angle3D = (90 - cricketDegree - 90) * (Math.PI / 180); // Rotate 90° clockwise
    
    // Calculate boundary point from striker position
    const boundaryX = strikerX + Math.cos(angle3D) * radius;
    const boundaryZ = strikerZ + Math.sin(angle3D) * radius;
    
    // Calculate center position and length for the line from striker to boundary
    const centerX = (strikerX + boundaryX) / 2;
    const centerZ = (strikerZ + boundaryZ) / 2;
    const lineLength = Math.sqrt(
      Math.pow(boundaryX - strikerX, 2) + 
      Math.pow(boundaryZ - strikerZ, 2)
    );

    // Create line using cylinder mesh for better visibility
    lines.push(
      <mesh 
        key={`radial-line-${i}`} 
        position={[centerX, 0.3, centerZ]} 
        rotation={[0, -angle3D, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.05, 0.05, lineLength, 8]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.9}
        />
      </mesh>
    );
  }

  // Create degree markers and labels at key positions (cricket field positioning, rotated 90° clockwise, centered at striker)
  const keyDegrees = [0, 45, 90, 135, 180, 225, 270, 315]; // Cricket field degrees
  
  keyDegrees.forEach((cricketDegree) => {
    // Convert cricket degree to 3D angle with 90° clockwise rotation
    const angle3D = (90 - cricketDegree - 90) * (Math.PI / 180);
    const markerRadius = radius - 2; // Position markers near boundary from striker
    const markerX = strikerX + Math.cos(angle3D) * markerRadius;
    const markerZ = strikerZ + Math.sin(angle3D) * markerRadius;

    // Create degree marker (small sphere)
    degreeMarkers.push(
      <mesh key={`degree-marker-${cricketDegree}`} position={[markerX, 0.3, markerZ]}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshBasicMaterial color="#ff6600" />
      </mesh>
    );

    // Add text labels for key degrees
    const labelRadius = radius; // At boundary from striker
    const labelX = strikerX + Math.cos(angle3D) * labelRadius;
    const labelZ = strikerZ + Math.sin(angle3D) * labelRadius;

    // Create text sprite with proper cricket field labels
    try {
      sectionLabels.push(
        <group key={`label-${cricketDegree}`} position={[labelX, 2, labelZ]}>
          <Text
            position={[0, 0, 0]}
            fontSize={1.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {cricketDegree}°
          </Text>
          
          {/* Position name below degree */}
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.8}
            color="#ffff00"
            anchorX="center"
            anchorY="middle"
          >
            {getPositionName(cricketDegree)}
          </Text>
          
          {/* Small line pointing to the exact degree */}
          <mesh position={[0, -2.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        </group>
      );
    } catch (error) {
      console.warn('Text rendering failed, using fallback cubes:', error);
      // Fallback to colored cubes if Text fails
      sectionLabels.push(
        <group key={`label-${cricketDegree}`} position={[labelX, 2, labelZ]}>
          <mesh>
            <boxGeometry args={[1, 1, 0.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      );
    }
  });

  // Create section area highlights with better visibility (cricket field positioning, rotated 90° clockwise, centered at striker)
  const sectionAreas = [];
  for (let i = 0; i < 8; i++) {
    // Calculate middle angle for each section using cricket field positioning with 90° clockwise rotation
    const cricketDegree = i * 45 + 22.5; // Middle of each 45° section
    const angle3D = (90 - cricketDegree - 90) * (Math.PI / 180); // Convert to 3D coordinates with rotation
    
    // Create a visible sector indicator at the middle of each section from striker position
    const indicatorRadius = radius * 0.7;
    const indicatorX = strikerX + Math.cos(angle3D) * indicatorRadius;
    const indicatorZ = strikerZ + Math.sin(angle3D) * indicatorRadius;
    
    sectionAreas.push(
      <group key={`sector-${i}`}>
        {/* Sector number indicator */}
        <mesh position={[indicatorX, 1, indicatorZ]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial 
            color={`hsl(${i * 45}, 70%, 60%)`} 
            transparent 
            opacity={0.8}
          />
        </mesh>
        
        {/* Section number text - with error handling */}
        {(() => {
          try {
            return (
              <Text
                position={[indicatorX, 1, indicatorZ]}
                fontSize={1}
                color="#000000"
                anchorX="center"
                anchorY="middle"
              >
                {i + 1}
              </Text>
            );
          } catch (error) {
            console.warn('Section text rendering failed:', error);
            return null;
          }
        })()}
      </group>
    );
  }

  return (
    <group name="wagon-wheel" position={[0, 0.5, 0]}>
      {/* Debug marker to confirm component is rendering */}
      <mesh position={[strikerX, 2, strikerZ]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      
      {/* Radial lines from striker to boundary */}
      {lines}
      
      {/* Concentric circles centered at striker */}
      {circles}
      
      {/* Degree markers */}
      {degreeMarkers}
      
      {/* Section labels */}
      {sectionLabels}
      
      {/* Section area highlights */}
      {sectionAreas}
      
      {/* Center marker at striker position */}
      <mesh position={[strikerX, 0.4, strikerZ]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      {/* Direction indicator line (0° reference) - pointing to Square Leg position after 90° clockwise rotation */}
      <mesh position={[strikerX + 2.5, 0.25, strikerZ]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 5, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      {/* 0° Arrow head pointing to Square Leg after rotation */}
      <mesh position={[strikerX + 5.2, 0.25, strikerZ]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </group>
  );
};

export default WagonWheel;
