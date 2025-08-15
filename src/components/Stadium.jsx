import React, { useState, useEffect } from 'react';
import { STADIUM_CONFIG, COLORS } from '../constants/cameraViews';
import CricketGame from './CricketGame';
import StadiumModel from './StadiumModel';

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

// Pure component for boundary line
const BoundaryLine = ({ radius, color }) => (
  <mesh position={[0, 0.05, 0]}>
    <torusGeometry args={[radius, 0.1, 8, 32]} />
    <meshBasicMaterial color={color} />
  </mesh>
);

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
  const radius = 25;
  const sections = 8;
  
  for (let i = 0; i < sections; i++) {
    const angle = (i / sections) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    seats.push(
      <mesh key={i} position={[x, 3, z]} castShadow>
        <boxGeometry args={[8, 6, 3]} />
        <meshLambertMaterial color={COLORS.stadium} />
      </mesh>
    );
  }
  
  return <group>{seats}</group>;
};

// Main Stadium component
const Stadium = ({ onGameStateChange, currentPlayerPositions, isPositionEditorActive = false }) => {
  const { field, pitch } = STADIUM_CONFIG;
  const [useCustomModel, setUseCustomModel] = useState(false);
  
  console.log("Stadium rendering, useCustomModel:", useCustomModel);

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
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [useCustomModel]);
  
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
          
          {/* Boundary Line */}
          <BoundaryLine 
            radius={field.radius - 1} 
            color={COLORS.boundary} 
          />
          
          {/* Wickets (swapped positions) */}
          <Wicket position={[0, 0, -10]} />
          <Wicket position={[0, 0, 10]} />
          
          {/* Stadium Seating */}
          <StadiumSeating />
          
          {/* Creases (swapped positions) */}
          <mesh position={[0, 0.16, -10]}>
            <boxGeometry args={[3.5, 0.01, 0.05]} />
            <meshBasicMaterial color={COLORS.boundary} />
          </mesh>
          <mesh position={[0, 0.16, 10]}>
            <boxGeometry args={[3.5, 0.01, 0.05]} />
            <meshBasicMaterial color={COLORS.boundary} />
          </mesh>
        </>
      )}
      
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