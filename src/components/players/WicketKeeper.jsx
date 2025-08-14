import React from 'react';
import { useFrame } from '@react-three/fiber';

const WicketKeeper = ({ position = [0, 0, 0] }) => {
  const meshRef = React.useRef();
  
  // Crouching animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group position={position}>
      <group ref={meshRef}>
        {/* Head */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color="#8B6F47" />
        </mesh>
        
        {/* Helmet with grill */}
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshLambertMaterial color="#006400" />
        </mesh>
        
        {/* Face grill */}
        <mesh position={[0, 1.45, 0.15]}>
          <boxGeometry args={[0.2, 0.15, 0.02]} />
          <meshLambertMaterial color="#666666" wireframe />
        </mesh>
        
        {/* Body - slightly bent */}
        <mesh position={[0, 1.1, 0]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.25, 0.7, 16]} />
          <meshLambertMaterial color="#006400" />
        </mesh>
        
        {/* Arms - ready to catch */}
        <mesh position={[-0.3, 1.0, 0.3]} rotation={[-0.8, 0, -0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#8B6F47" />
        </mesh>
        <mesh position={[0.3, 1.0, 0.3]} rotation={[-0.8, 0, 0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#8B6F47" />
        </mesh>
        
        {/* Gloves */}
        <mesh position={[-0.35, 0.7, 0.4]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0.35, 0.7, 0.4]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        
        {/* Legs - crouched */}
        <mesh position={[-0.1, 0.3, 0]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.7, 8]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.1, 0.3, 0]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.7, 8]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Pads */}
        <mesh position={[-0.1, 0.3, 0.1]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.15, 0.6, 0.1]} />
          <meshLambertMaterial color="#E0E0E0" />
        </mesh>
        <mesh position={[0.1, 0.3, 0.1]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.15, 0.6, 0.1]} />
          <meshLambertMaterial color="#E0E0E0" />
        </mesh>
      </group>
    </group>
  );
};

export default WicketKeeper;
