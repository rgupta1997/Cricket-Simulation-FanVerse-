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

// Pure component for stadium seating
const StadiumSeating = () => {
  const seats = [];
  const baseRadius = 35; // Start closer to boundary wall
  const sections = 16; // Fewer sections for cleaner look
  const rowCount = 25; // Reasonable number of rows
  const rowHeight = 0.6; // Taller rows for better stepping
  const rowDepth = 1.2; // Deeper rows for proper seating
  const sectionSpacing = 0.05; // Very minimal spacing between sections
  const sectionAngle = (Math.PI * 2) / sections;
  const wallThickness = 0.5; // Thicker walls
  const riseAngle = Math.PI / 6; // 30 degree rise angle
  
  // Create tiered seating sections
  for (let i = 0; i < sections; i++) {
    const angle = i * sectionAngle;
    const nextAngle = (i + 1) * sectionAngle;
    const midAngle = (angle + nextAngle) / 2;
    
    // Skip sections behind wickets (create gaps)
    if (Math.abs(Math.sin(midAngle)) > 0.88) continue;
    
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
      
      // Add seat following the circular arc
      sectionSeats.push(
        <mesh 
          key={`seat_${i}_${row}`}
          position={[centerX, elevation, centerZ]}
          rotation={[-riseAngle, angleToCenter, 0]}
        >
          <boxGeometry 
            args={[
              arcLength - sectionSpacing * 0.5, // Width based on arc length
              rowHeight * 0.2, // Thin seat surface
              rowDepth
            ]} 
          />
          <meshStandardMaterial 
            color={COLORS.stadium.seats}
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      );
      
      // Add riser (vertical part between rows)
      if (row > 0) {
        const prevElevation = (row - 1) * rowHeight + ((row - 1) * rowDepth * Math.sin(riseAngle));
        const riserHeight = elevation - prevElevation;
        
        // Calculate previous row position for riser
        const prevRadius = baseRadius + ((row - 1) * rowDepth * Math.cos(riseAngle));
        const prevX1 = Math.cos(angle) * prevRadius;
        const prevZ1 = Math.sin(angle) * prevRadius;
        const prevX2 = Math.cos(nextAngle) * prevRadius;
        const prevZ2 = Math.sin(nextAngle) * prevRadius;
        const prevCenterX = (prevX1 + prevX2) / 2;
        const prevCenterZ = (prevZ1 + prevZ2) / 2;
        
        sectionSeats.push(
          <mesh 
            key={`riser_${i}_${row}`}
            position={[
              (centerX + prevCenterX) / 2,
              (elevation + prevElevation) / 2,
              (centerZ + prevCenterZ) / 2
            ]}
            rotation={[0, angleToCenter, 0]}
          >
            <boxGeometry 
              args={[
                arcLength - sectionSpacing * 0.5,
                riserHeight,
                0.15 // Slightly thicker riser
              ]} 
            />
            <meshStandardMaterial 
              color={COLORS.stadium.divider}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
        );
      }
    }
    
    seats.push(
      <group key={`section_${i}`}>
        {sectionSeats}
      </group>
    );
    
    // Add solid section walls with proper angle
    // Create triangular side walls
    const wallPoints = [];
    for (let r = 0; r <= rowCount; r++) {
      const radius = baseRadius + (r * rowDepth * Math.cos(riseAngle));
      const height = r * rowHeight + (r * rowDepth * Math.sin(riseAngle));
      wallPoints.push({ radius, height });
    }
    
    // Left wall
    for (let r = 0; r < wallPoints.length - 1; r++) {
      const curr = wallPoints[r];
      const next = wallPoints[r + 1];
      
      seats.push(
        <mesh
          key={`wall_left_${i}_${r}`}
          position={[
            Math.cos(angle) * (curr.radius + next.radius) / 2,
            (curr.height + next.height) / 2,
            Math.sin(angle) * (curr.radius + next.radius) / 2
          ]}
          rotation={[0, -angle + Math.PI/2, riseAngle]}
        >
          <boxGeometry 
            args={[
              wallThickness,
              Math.sqrt(Math.pow(next.radius - curr.radius, 2) + Math.pow(next.height - curr.height, 2)),
              rowDepth
            ]} 
          />
          <meshStandardMaterial 
            color={COLORS.stadium.divider}
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      );
    }
    
    // Right wall (similar structure)
    for (let r = 0; r < wallPoints.length - 1; r++) {
      const curr = wallPoints[r];
      const next = wallPoints[r + 1];
      
      seats.push(
        <mesh
          key={`wall_right_${i}_${r}`}
          position={[
            Math.cos(nextAngle) * (curr.radius + next.radius) / 2,
            (curr.height + next.height) / 2,
            Math.sin(nextAngle) * (curr.radius + next.radius) / 2
          ]}
          rotation={[0, -nextAngle + Math.PI/2, riseAngle]}
        >
          <boxGeometry 
            args={[
              wallThickness,
              Math.sqrt(Math.pow(next.radius - curr.radius, 2) + Math.pow(next.height - curr.height, 2)),
              rowDepth
            ]} 
          />
          <meshStandardMaterial 
            color={COLORS.stadium.divider}
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      );
    }
  }
  
  // Add back wall connecting to boundary
  for (let i = 0; i < sections; i++) {
    const angle = i * sectionAngle;
    const nextAngle = (i + 1) * sectionAngle;
    const midAngle = (angle + nextAngle) / 2;
    
    // Skip sections behind wickets
    if (Math.abs(Math.sin(midAngle)) > 0.88) continue;
    
    // Back wall at ground level
    const maxHeight = rowCount * rowHeight + (rowCount * rowDepth * Math.sin(riseAngle));
    
    seats.push(
      <mesh
        key={`back_wall_${i}`}
        position={[
          Math.cos(midAngle) * (baseRadius - 1),
          maxHeight / 2,
          Math.sin(midAngle) * (baseRadius - 1)
        ]}
        rotation={[0, -midAngle, 0]}
      >
        <boxGeometry 
          args={[
            (nextAngle - angle) * baseRadius,
            maxHeight,
            2
          ]} 
        />
        <meshStandardMaterial 
          color={COLORS.stadium.support}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
    );
  }
  
  return <group>{seats}</group>;
};

// Main Stadium component
const Stadium = ({ onGameStateChange, currentPlayerPositions, isPositionEditorActive = false }) => {
  const { field, pitch } = STADIUM_CONFIG;
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [showWagonWheel, setShowWagonWheel] = useState(false);
  
  console.log("Stadium rendering, useCustomModel:", useCustomModel, "showWagonWheel:", showWagonWheel);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === 'c') {
        setUseCustomModel(prev => !prev);
        console.log('Switched stadium model:', !useCustomModel ? '3D Model' : 'Basic');
        // Force a re-render of the entire scene
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }
      
      // Add 'W' key to toggle wagon wheel
      if (event.key.toLowerCase() === 'w') {
        setShowWagonWheel(prev => !prev);
        console.log('Toggled wagon wheel:', !showWagonWheel ? 'ON' : 'OFF');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [useCustomModel, showWagonWheel]);
  
  return (
    <group>
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
            radius={field.radius * 0.85}  // Move inward to inner circle
            height={1}    // Standard height
            depth={0.5}   // Standard depth for support
          />
          
          {/* Outer Boundary Wall */}
          <BoundaryWall 
            radius={field.radius}  // At the original boundary position
            height={2}    // Taller wall
          />
          
          {/* Wickets (swapped positions) */}
          <Wicket position={[0, 0, -10]} /> {/*Adjusted for larger field */}
          <Wicket position={[0, 0, 10]} /> {/* Adjusted for larger field */}
          
          {/* Stadium Seating */}
          <StadiumSeating />
          
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
        radius={field.radius * 0.9} 
        visible={showWagonWheel}
        strikerPosition={currentPlayerPositions?.striker?.position || [0, 0, -9]}
      />
      
      {/* Cricket Game (shown in both stadium modes) */}
      <CricketGame 
        use3DModel={useCustomModel} 
        onGameStateChange={onGameStateChange}
        currentPlayerPositions={currentPlayerPositions}
        isPositionEditorActive={isPositionEditorActive}
      />
    </group>
  );
};

export default Stadium;