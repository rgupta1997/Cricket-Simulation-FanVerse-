import React from 'react';
import { useFrame } from '@react-three/fiber';

const Ball = ({ position = [0, 0.5, 0], isMoving = false }) => {
  const meshRef = React.useRef();
  
  // Ball movement animation
  useFrame((state, delta) => {
    if (meshRef.current && isMoving) {
      // Rotate the ball when moving
      meshRef.current.rotation.x += delta * 10;
      meshRef.current.rotation.z += delta * 5;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshLambertMaterial color="#FF0000" />
      </mesh>
      
      {/* Seam of the ball */}
      <mesh>
        <torusGeometry args={[0.05, 0.002, 4, 24]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

export default Ball;
