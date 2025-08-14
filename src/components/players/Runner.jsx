import React from 'react';
import { useFrame } from '@react-three/fiber';

const Runner = ({ position = [0, 0, 0] }) => {
  const meshRef = React.useRef();
  
  // Ready to run animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group position={position}>
      <group ref={meshRef}>
        {/* Head */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Helmet */}
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshLambertMaterial color="#FFFF00" />
        </mesh>
        
        {/* Body - leaning forward slightly */}
        <mesh position={[0, 1.2, 0]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Arms - running position */}
        <mesh position={[-0.3, 1.3, -0.1]} rotation={[0.5, 0, -0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        <mesh position={[0.3, 1.3, 0.1]} rotation={[-0.5, 0, 0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Legs - running stance */}
        <mesh position={[-0.1, 0.4, -0.1]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.1, 0.4, 0.1]} rotation={[-0.2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Pads */}
        <mesh position={[-0.1, 0.4, 0.08]}>
          <boxGeometry args={[0.15, 0.7, 0.1]} />
          <meshLambertMaterial color="#E0E0E0" />
        </mesh>
        <mesh position={[0.1, 0.4, 0.08]}>
          <boxGeometry args={[0.15, 0.7, 0.1]} />
          <meshLambertMaterial color="#E0E0E0" />
        </mesh>
        
        {/* Bat (holding while running) */}
        <group position={[0.35, 1.1, -0.1]} rotation={[0.3, 0, -0.2]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 0.7, 8]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default Runner;
