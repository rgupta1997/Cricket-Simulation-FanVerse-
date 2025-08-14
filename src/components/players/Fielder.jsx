import React from 'react';
import { useFrame } from '@react-three/fiber';
import PlayerModel from './PlayerModel';

const Fielder = ({ position = [0, 0, 0], teamColor = "#0000FF", use3DModel = false }) => {
  const meshRef = React.useRef();
  
  // Simple standing animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  if (use3DModel) {
    console.log("use3DModel", use3DModel);
    return (
      <PlayerModel 
        position={[position[0], 0, position[2]]}
        rotation={[0, Math.PI, 0]}
        scale={0.5} // Adjusted scale to match field size
      />
    );
  }

  return (
    <group position={position}>
      <group ref={meshRef}>
        {/* Head */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        
        {/* Cap */}
        <mesh position={[0, 1.78, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
          <meshLambertMaterial color={teamColor} />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.22, 0.8, 16]} />
          <meshLambertMaterial color={teamColor} />
        </mesh>
        
        {/* Arms - ready position */}
        <mesh position={[-0.25, 1.2, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshLambertMaterial color="#FDB5A6" />
        </mesh>
        <mesh position={[0.25, 1.2, 0]} rotation={[0, 0, 0.2]}>
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
        
        {/* Shoes */}
        <mesh position={[-0.1, 0, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.2]} />
          <meshLambertMaterial color="#333333" />
        </mesh>
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.2]} />
          <meshLambertMaterial color="#333333" />
        </mesh>
      </group>
    </group>
  );
};

export default Fielder;
