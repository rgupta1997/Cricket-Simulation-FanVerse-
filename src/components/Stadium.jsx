/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { STADIUM_CONFIG, COLORS } from '../constants/cameraViews';
import CricketGame from './CricketGame';
import StadiumModel from './StadiumModel';
import WagonWheel from './WagonWheel';

// Pure component for the main field with realistic grass texture
const Field = ({ radius, height, color }) => (
  <mesh position={[0, -height/2, 0]} receiveShadow>
    <cylinderGeometry args={[radius, radius, height, 64]} />
    <meshStandardMaterial 
      color={color}
      roughness={0.8}
      metalness={0.1}
    />
  </mesh>
);

// Pure component for the cricket pitch with realistic clay texture
const Pitch = ({ width, length, height, color }) => (
  <mesh position={[0, height/2, 0]} receiveShadow>
    <boxGeometry args={[width, height, length]} />
    <meshStandardMaterial 
      color={color}
      roughness={0.9}
      metalness={0}
    />
  </mesh>
);

// Pure component for outer boundary wall
const BoundaryWall = ({ radius, height = 2 }) => {
  const segments = 72;
  const boards = [];
  
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const nextAngle = ((i + 1) / segments) * Math.PI * 2;
    
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = Math.cos(nextAngle) * radius;
    const z2 = Math.sin(nextAngle) * radius;
    
    const segmentAngle = Math.atan2(z2 - z1, x2 - x1);
    
    boards.push(
      <mesh 
        key={i} 
        position={[(x1 + x2)/2, height/2, (z1 + z2)/2]}
        rotation={[0, -segmentAngle, 0]}
      >
        <boxGeometry 
          args={[
            Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(z2-z1, 2)) + 0.01,
            height,
            0.3 // Thick wall
          ]} 
        />
        <meshStandardMaterial 
          color={COLORS.boundary.wall} // Outer wall color
          metalness={0.2}
          roughness={0.8}
        />
  </mesh>
);
  }
  
  return <group>{boards}</group>;
};

// Pure component for curved advertising board boundary
const AdvertisingBoundary = ({ radius, height = 1, depth = 0.5 }) => {
  const segments = 72; // Balanced number of segments for smooth circle
  const boards = [];
  
  // Create boards around the boundary
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const nextAngle = ((i + 1) / segments) * Math.PI * 2;
    
    // Calculate positions for perfect circle
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = Math.cos(nextAngle) * radius;
    const z2 = Math.sin(nextAngle) * radius;
    
    // Calculate angle for this segment
    const segmentAngle = Math.atan2(z2 - z1, x2 - x1);
    
    // Create board segment
    boards.push(
      <group key={i} position={[0, height/2, 0]}>
        {/* Main board face - curved to follow boundary */}
        <mesh 
          position={[(x1 + x2)/2, 0, (z1 + z2)/2]}
          rotation={[0, -segmentAngle, 0]}
        >
          <boxGeometry 
            args={[
              Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(z2-z1, 2)) + 0.01, // Minimal overlap
              height,
              0.08 // Standard board thickness
            ]} 
          />
          <meshStandardMaterial 
            color={COLORS.boundary.main}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
        
        {/* Support structure - follows curve */}
        <mesh 
          position={[(x1 + x2)/2, -height/3, (z1 + z2)/2]}
          rotation={[Math.PI/6, -segmentAngle, 0]}
        >
          <boxGeometry 
            args={[
              Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(z2-z1, 2)) + 0.02,
              depth,
              0.1
            ]} 
          />
          <meshStandardMaterial 
            color={COLORS.boundary.support}
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
        
        {/* Additional bottom support */}
        <mesh 
          position={[(x1 + x2)/2, -height/1.5, (z1 + z2)/2]}
          rotation={[0, -segmentAngle, 0]}
        >
          <boxGeometry 
            args={[
              Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(z2-z1, 2)) + 0.02,
              0.1,
              depth * 1.5
            ]} 
          />
          <meshStandardMaterial 
            color={COLORS.boundary.support}
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </group>
    );
  }
  
  return <group>{boards}</group>;
};

// Pure component for realistic wickets
const Wicket = ({ position }) => (
  <group position={position}>
    {/* Stumps with wood texture */}
    <mesh position={[-0.1, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
      <meshStandardMaterial 
        color="#8B4513" 
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
    <mesh position={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
      <meshStandardMaterial 
        color="#8B4513"
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
    <mesh position={[0.1, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
      <meshStandardMaterial 
        color="#8B4513"
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
    {/* Bails with polished wood */}
    <mesh position={[-0.05, 0.82, 0]} castShadow>
      <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
      <meshStandardMaterial 
        color="#A0522D"
        roughness={0.4}
        metalness={0.2}
      />
    </mesh>
    <mesh position={[0.05, 0.82, 0]} castShadow>
      <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
      <meshStandardMaterial 
        color="#A0522D"
        roughness={0.4}
        metalness={0.2}
      />
    </mesh>
  </group>
);

// Pure component for stadium seating with packed crowd - PERFORMANCE OPTIMIZED
const StadiumSeating = () => {
  const seats = [];
  const crowd = [];
  const baseRadius = 53; // ✅ CORRECTED: Start outside 50m playing boundary
  const sections = 16; // Reduced sections for better performance
  const rowCount = 12; // Reduced rows for better performance  
  const rowHeight = 0.5; // Tighter row spacing
  const rowDepth = 0.8; // Smaller depth to fit more rows
  const sectionSpacing = 0.02; // Minimal spacing for packed look
  const sectionAngle = (Math.PI * 2) / sections;
  const wallThickness = 0.3; // Thinner walls
  const riseAngle = Math.PI / 8; // Gentler rise for better viewing
  
  // Create tiered seating sections
  for (let i = 0; i < sections; i++) {
    const angle = i * sectionAngle;
    const nextAngle = (i + 1) * sectionAngle;
    const midAngle = (angle + nextAngle) / 2;
    
    // Skip sections behind wickets (create smaller gaps for more crowd)
    if (Math.abs(Math.sin(midAngle)) > 0.95) continue;
    
    // Create complete seating block for this section
    const sectionSeats = [];
    
    for (let row = 0; row < rowCount; row++) {
      // Calculate stepped position
      const rowRadius = baseRadius + (row * rowDepth * Math.cos(riseAngle));
      const elevation = row * rowHeight + (row * rowDepth * Math.sin(riseAngle));
      
      // Calculate positions
      const x1 = Math.cos(angle) * rowRadius;
      const z1 = Math.sin(angle) * rowRadius;
      const x2 = Math.cos(nextAngle) * rowRadius;
      const z2 = Math.sin(nextAngle) * rowRadius;
      
      // Calculate center and angle
      const centerX = (x1 + x2) / 2;
      const centerZ = (z1 + z2) / 2;
      const angleToCenter = Math.atan2(-centerZ, -centerX);
      
      // Calculate arc length for this section
      const arcLength = rowRadius * (nextAngle - angle);
      
      // Add crowd/audience on seats - optimized density for performance
      const spectatorCount = Math.floor(arcLength * 2.2); // Reduced to 2.2 spectators per meter for better performance
      
      // Create individual seat sections aligned with spectators
      for (let s = 0; s < spectatorCount; s++) {
        const spectatorOffset = (s / spectatorCount - 0.5) * (arcLength - 0.5);
        const spectatorX = centerX + Math.cos(angleToCenter + Math.PI/2) * spectatorOffset;
        const spectatorZ = centerZ + Math.sin(angleToCenter + Math.PI/2) * spectatorOffset;
        
        // Add seat panel perfectly aligned with spectator position
      sectionSeats.push(
        <mesh 
            key={`seat_${i}_${row}_${s}`}
            position={[spectatorX, elevation - 0.1, spectatorZ]} // Slightly below spectator
          rotation={[-riseAngle, angleToCenter, 0]}
        >
          <boxGeometry 
            args={[
                0.3, // Individual seat width
                0.15, // Thin seat surface
                0.4 // Seat depth
            ]} 
          />
          <meshStandardMaterial 
            color={COLORS.stadium.seats}
            metalness={0.2}
            roughness={0.8}
              wireframe={false}
          />
        </mesh>
      );
      
        // Random spectator colors for realistic crowd
        const crowdColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const randomColor = crowdColors[Math.floor(Math.random() * crowdColors.length)];
        
        // Performance optimization: Use simpler geometry for distant spectators
        const isDistantRow = row > 8; // Rows further back get simpler geometry
        const spectatorSize = isDistantRow ? 0.12 : 0.15; // Smaller for distant rows
        const spectatorHeight = isDistantRow ? 0.3 : 0.4; // Shorter for distant rows
        
        crowd.push(
          <mesh 
            key={`spectator_${i}_${row}_${s}`}
            position={[spectatorX, elevation + 0.15, spectatorZ]} // Sitting on seat
            rotation={[-riseAngle, angleToCenter, 0]}
          >
            <boxGeometry args={[spectatorSize, spectatorHeight, spectatorSize]} />
            <meshStandardMaterial 
              color={randomColor}
              metalness={0.1}
              roughness={0.9}
              wireframe={false}
            />
          </mesh>
        );
      }
      
      // Remove riser - cleaner look without vertical supports
    }
    
    seats.push(
      <group key={`section_${i}`}>
        {sectionSeats}
      </group>
    );
    
    // Remove all wall structures - cleaner stadium appearance
  }
  
  // Remove back wall structures - cleaner stadium look
  
    // Simple roof structure - minimal visual clutter
  const roof = [];
  const roofSections = 12; // Fewer sections for cleaner look
  for (let i = 0; i < roofSections; i++) {
    const angle = (i / roofSections) * Math.PI * 2;
    const nextAngle = ((i + 1) / roofSections) * Math.PI * 2;
    const midAngle = (angle + nextAngle) / 2;
    
    // Skip roof sections behind wickets
    if (Math.abs(Math.sin(midAngle)) > 0.95) continue;
    
    const roofRadius = baseRadius + (rowCount * rowDepth * Math.cos(riseAngle)) + 1;
    const roofHeight = rowCount * rowHeight + (rowCount * rowDepth * Math.sin(riseAngle)) + 3;
    
    const centerX = Math.cos(midAngle) * roofRadius;
    const centerZ = Math.sin(midAngle) * roofRadius;
    const arcLength = roofRadius * (nextAngle - angle);
    
    roof.push(
      <mesh
        key={`roof_${i}`}
        position={[centerX, roofHeight, centerZ]}
        rotation={[0, midAngle, 0]}
      >
        <boxGeometry args={[arcLength, 0.1, 2]} />
        <meshStandardMaterial 
          color="#34495e"
          metalness={0.1}
          roughness={0.8}
          wireframe={false}
        />
      </mesh>
    );
  }
  
  return <group>{seats}{crowd}{roof}</group>;
};

// Main Stadium component
const Stadium = ({ onGameStateChange, currentPlayerPositions, isPositionEditorActive = false, dummyGameData = null, isDummyDataActive = false, onBallPositionUpdate }) => {
  const { field, pitch, boundaries } = STADIUM_CONFIG;
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [showWagonWheel, setShowWagonWheel] = useState(false);
  
  // Only log on initial render or when states actually change
  // console.log("Stadium rendering, useCustomModel:", useCustomModel, "showWagonWheel:", showWagonWheel);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === 'c') {
        setUseCustomModel(prev => {
          console.log('Switched stadium model:', !prev ? '3D Model' : 'Basic');
          return !prev;
        });
        // Force a re-render of the entire scene
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }
      
      // Add 'W' key to toggle wagon wheel
      if (event.key.toLowerCase() === 'w') {
        setShowWagonWheel(prev => {
          console.log('Toggled wagon wheel:', !prev ? 'ON' : 'OFF');
          return !prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []); // Empty dependency array is correct here since we use functional updates
  
  return (
    <group>
      {/* Working Stadium Lighting System */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[30, 40, 30]}
        intensity={1.8}
        castShadow={true}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <directionalLight
        position={[-30, 40, -30]}
        intensity={1.2}
        castShadow={false}
      />
      <directionalLight
        position={[0, 50, 0]}
        intensity={1.0}
        castShadow={false}
      />
      
      {/* Stadium Model */}
      {useCustomModel ? (
        <StadiumModel visible={true} />
      ) : (
        <>
          {/* Main Field */}
          <Field 
            radius={field.radius} 
            height={field.height} 
            color={COLORS.grass} 
          />
          
          {/* Cricket Pitch */}
          <Pitch 
            width={pitch.width} 
            length={pitch.length} 
            height={pitch.height} 
            color={COLORS.pitch} 
          />
          
          {/* Inner Advertising Boundary */}
          <AdvertisingBoundary 
            radius={boundaries.innerRadius}  // 55m - Realistic cricket boundary
            height={1.2}    // Slightly taller for better visibility
            depth={0.6}     // Deeper support for larger boundary
          />
          
          {/* Outer Boundary Wall */}
          <BoundaryWall 
            radius={boundaries.outerRadius}  // 65m - Stadium perimeter wall
            height={3}      // Taller wall for larger stadium
          />
          
          {/* Wickets (swapped positions) */}
          <Wicket position={[0, 0, -10]} /> {/*Adjusted for larger field */}
          <Wicket position={[0, 0, 10]} /> {/* Adjusted for larger field */}
          
          {/* Stadium Seating with Packed Crowd */}
          <StadiumSeating />
          
          {/* Professional Cricket Stadium Floodlights - Diagonal Positioning */}
          <group>
            {/* Four diagonal floodlight towers like real cricket stadiums */}
            
            {/* Tower 1: Northeast Diagonal */}
            <group position={[70, 0, 70]}>
              {/* Main tower pole with professional taper */}
              <mesh position={[0, 17, 0]}>
                <cylinderGeometry args={[0.4, 0.7, 34, 12]} />
                <meshStandardMaterial color="#2C3E50" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* Tower base platform */}
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 1, 8]} />
                <meshStandardMaterial color="#34495E" metalness={0.5} roughness={0.5} />
              </mesh>
              {/* Light fixture mounting frame */}
              <mesh position={[0, 32, 0]}>
                <boxGeometry args={[4, 1.5, 2]} />
                <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Individual floodlight arrays */}
              <mesh position={[-1.5, 33, -0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[0, 33, -0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[1.5, 33, -0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              
              {/* Simplified Floodlight Illumination */}
              <pointLight
                position={[0, 33, 0]}
                intensity={200}
                distance={80}
                color="#FFFFFF"
              />
            </group>
            
            {/* Tower 2: Northwest Diagonal */}
            <group position={[-70, 0, 70]}>
              <mesh position={[0, 17, 0]}>
                <cylinderGeometry args={[0.4, 0.7, 34, 12]} />
                <meshStandardMaterial color="#2C3E50" metalness={0.6} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 1, 8]} />
                <meshStandardMaterial color="#34495E" metalness={0.5} roughness={0.5} />
              </mesh>
              <mesh position={[0, 32, 0]}>
                <boxGeometry args={[4, 1.5, 2]} />
                <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[-1.5, 33, -0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[0, 33, -0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[1.5, 33, -0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              
              {/* Simplified Floodlight Illumination */}
              <pointLight
                position={[0, 33, 0]}
                intensity={200}
                distance={80}
                color="#FFFFFF"
              />
            </group>
            
            {/* Tower 3: Southeast Diagonal */}
            <group position={[70, 0, -70]}>
              <mesh position={[0, 17, 0]}>
                <cylinderGeometry args={[0.4, 0.7, 34, 12]} />
                <meshStandardMaterial color="#2C3E50" metalness={0.6} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 1, 8]} />
                <meshStandardMaterial color="#34495E" metalness={0.5} roughness={0.5} />
              </mesh>
              <mesh position={[0, 32, 0]}>
                <boxGeometry args={[4, 1.5, 2]} />
                <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[-1.5, 33, 0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[0, 33, 0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[1.5, 33, 0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              
              {/* Simplified Floodlight Illumination */}
              <pointLight
                position={[0, 33, 0]}
                intensity={200}
                distance={80}
                color="#FFFFFF"
              />
            </group>
            
            {/* Tower 4: Southwest Diagonal */}
            <group position={[-70, 0, -70]}>
              <mesh position={[0, 17, 0]}>
                <cylinderGeometry args={[0.4, 0.7, 34, 12]} />
                <meshStandardMaterial color="#2C3E50" metalness={0.6} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 1, 8]} />
                <meshStandardMaterial color="#34495E" metalness={0.5} roughness={0.5} />
              </mesh>
              <mesh position={[0, 32, 0]}>
                <boxGeometry args={[4, 1.5, 2]} />
                <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[-1.5, 33, 0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[0, 33, 0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[1.5, 33, 0.5]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
                <meshStandardMaterial color="#FFFF90" emissive="#FFFF50" emissiveIntensity={0.6} />
              </mesh>
              
              {/* Simplified Floodlight Illumination */}
              <pointLight
                position={[0, 33, 0]}
                intensity={200}
                distance={80}
                color="#FFFFFF"
              />
            </group>
          </group>



          {/* Stadium Flags and Banners */}
          <group>
            {/* Team flags around the stadium */}
            <mesh position={[35, 8, 0]} rotation={[0, Math.PI/2, 0]}>
              <planeGeometry args={[3, 2]} />
              <meshStandardMaterial color="#FF6B6B" />
            </mesh>
            <mesh position={[-35, 8, 0]} rotation={[0, -Math.PI/2, 0]}>
              <planeGeometry args={[3, 2]} />
              <meshStandardMaterial color="#4ECDC4" />
            </mesh>
            <mesh position={[0, 8, 35]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[3, 2]} />
              <meshStandardMaterial color="#45B7D1" />
            </mesh>
            <mesh position={[0, 8, -35]} rotation={[0, 0, 0]}>
              <planeGeometry args={[3, 2]} />
              <meshStandardMaterial color="#96CEB4" />
            </mesh>
          </group>
          
          {/* Creases (swapped positions) */}
          <mesh position={[0, 0.16, -11]}> {/* Adjusted for larger field */}
            <boxGeometry args={[4, 0.01, 0.08]} /> {/* Slightly larger crease */}
            <meshBasicMaterial color={COLORS.boundary} />
          </mesh>
          <mesh position={[0, 0.16, 11]}> {/* Adjusted for larger field */}
            <boxGeometry args={[4, 0.01, 0.08]} /> {/* Slightly larger crease */}
            <meshBasicMaterial color={COLORS.boundary} />
          </mesh>
        </>
      )}
      
      {/* Wagon Wheel Overlay (shown in both stadium modes) */}
      <WagonWheel 
        radius={boundaries.playingRadius * 0.9} // Use playing boundary for wagon wheel
        visible={showWagonWheel}
        strikerPosition={currentPlayerPositions?.striker?.position || [0, 0, -9]}
      />
      
      {/* Cricket Game (shown in both stadium modes) */}
      <CricketGame 
        use3DModel={useCustomModel} 
        onGameStateChange={onGameStateChange}
        currentPlayerPositions={currentPlayerPositions}
        isPositionEditorActive={isPositionEditorActive}
        dummyGameData={dummyGameData}
        isDummyDataActive={isDummyDataActive}
        onBallPositionUpdate={onBallPositionUpdate}
      />
    </group>
  );
};

export default Stadium;