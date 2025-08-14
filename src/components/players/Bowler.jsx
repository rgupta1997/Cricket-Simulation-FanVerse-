import React from 'react';
import { useFrame } from '@react-three/fiber';

const Bowler = ({ position = [0, 0, 0] }) => {
  const meshRef = React.useRef();
  const ballRef = React.useRef();
  
  // Bowling action animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Simulate bowling action
      meshRef.current.rotation.x = Math.sin(time * 2) * 0.3;
    }
  });

  return (
    <group position={position}>
      <group ref={meshRef}>
        {/* Head */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color="#8B6F47" />
        </mesh>
        
        {/* Cap */}
        <mesh position={[0, 1.78, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.1, 16]} />
          <meshLambertMaterial color="#800080" />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
          <meshLambertMaterial color="#800080" />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.3, 1.3, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#8B6F47" />
        </mesh>
        <mesh position={[0.3, 1.3, 0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#8B6F47" />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.1, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.1, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Ball in hand */}
        <mesh ref={ballRef} position={[0.35, 1.5, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshLambertMaterial color="#FF0000" />
        </mesh>
      </group>
    </group>
  );
};

export default Bowler;
