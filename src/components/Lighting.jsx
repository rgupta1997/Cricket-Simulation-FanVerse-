import React from 'react';
import { STADIUM_CONFIG, COLORS } from '../constants/cameraViews';

// Pure component for a single light tower
const LightTower = ({ position, intensity = 1 }) => (
  <group position={position}>
    {/* Tower pole */}
    <mesh position={[0, position[1] / 2, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.3, position[1], 8]} />
      <meshLambertMaterial color="#333333" />
    </mesh>
    
    {/* Light fixture */}
    <mesh position={[0, position[1] - 2, 0]} castShadow>
      <cylinderGeometry args={[1, 0.5, 2, 8]} />
      <meshLambertMaterial color="#444444" />
    </mesh>
    
    {/* Light bulb */}
    <mesh position={[0, position[1] - 1, 0]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color={COLORS.lights} />
    </mesh>
    
    {/* Directional light */}
    <directionalLight
      position={[0, position[1], 0]}
      target-position={[0, 0, 0]}
      intensity={intensity}
      color={COLORS.lights}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-far={50}
      shadow-camera-left={-30}
      shadow-camera-right={30}
      shadow-camera-top={30}
      shadow-camera-bottom={-30}
    />
    
    {/* Point light for ambient effect */}
    <pointLight
      position={[0, position[1] - 1, 0]}
      intensity={intensity * 0.5}
      distance={30}
      decay={2}
      color={COLORS.lights}
    />
  </group>
);

// Pure component for creating multiple lights
const createLights = (positions, intensity) => {
  return positions.map((position, index) => (
    <LightTower 
      key={`light-${index}`} 
      position={position} 
      intensity={intensity} 
    />
  ));
};

// Main Lighting component with realistic lighting setup
const Lighting = ({ intensity = 1 }) => {
  const { lights } = STADIUM_CONFIG;
  
  return (
    <group>
      {/* Ambient light for overall scene illumination - softer for realism */}
      <ambientLight intensity={0.2} color="#e6e6e6" />
      
      {/* Hemisphere light for sky/ground color variation */}
      <hemisphereLight 
        color="#87CEEB"  // Sky blue
        groundColor="#8B7355"  // Earth brown
        intensity={0.4}
      />
      
      {/* Main sun/day light */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.8}
        color="#FFF5E1"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />
      
      {/* Stadium flood lights */}
      {createLights(lights.positions, intensity)}
      
      {/* Subtle fill light to reduce harsh shadows */}
      <directionalLight
        position={[-10, 15, -5]}
        intensity={0.3}
        color="#E6E6FA"
      />
    </group>
  );
};

export default Lighting;