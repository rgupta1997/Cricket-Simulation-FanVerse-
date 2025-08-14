import React from 'react';
import { useFrame } from '@react-three/fiber';

const Batsman = ({ position = [0, 0, 0], isStrike = true }) => {
  const meshRef = React.useRef();
  
  // Simple idle animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
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
          <meshLambertMaterial color={isStrike ? "#FF0000" : "#0000FF"} />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.3, 1.3, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        <mesh position={[0.3, 1.3, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#FDB5A6" />
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
        
        {/* Pads */}
        <mesh position={[-0.1, 0.4, 0.08]}>
          <boxGeometry args={[0.15, 0.7, 0.1]} />
          <meshLambertMaterial color="#E0E0E0" />
        </mesh>
        <mesh position={[0.1, 0.4, 0.08]}>
          <boxGeometry args={[0.15, 0.7, 0.1]} />
          <meshLambertMaterial color="#E0E0E0" />
        </mesh>
        
        {/* Bat */}
        <group position={[0.4, 1.0, 0]} rotation={[0, 0, -0.5]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.8, 8]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.15, 0.3, 0.03]} />
            <meshLambertMaterial color="#D2691E" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default Batsman;
